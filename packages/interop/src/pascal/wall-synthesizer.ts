import type { Floor, Point, Wall } from '@ai-floor-planner/core';

export interface SynthesizedWall {
  id: string;
  floorId: string;
  startPoint: Point;
  endPoint: Point;
  thickness: number; // mm
  heightMm: number;  // mm
  wallUse: 'EXTERNAL' | 'INTERNAL_PARTITION' | 'UNIT_SEPARATION' | 'COMMON_CORRIDOR';
  roomIds: string[];
  canonicalWallId?: string;
  isSynthesized: boolean;
}

interface SegmentInput {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roomId?: string;
  wallId?: string;
  wallUse?: 'EXTERNAL' | 'INTERNAL_PARTITION' | 'UNIT_SEPARATION' | 'COMMON_CORRIDOR';
  thickness?: number;
}

function snap(val: number, grid = 10): number {
  return Math.round(val / grid) * grid;
}

function pointDist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

/**
 * Extracts and synthesizes a complete, non-overlapping deterministic wall network for a floor.
 * Merges existing `floor.walls` with boundary edges of all rooms, deduplicating shared partitions (115mm)
 * and exterior walls (230mm).
 */
export function synthesizeFloorWalls(floor: Floor): SynthesizedWall[] {
  const floorHeightMm = floor.floorHeight ?? 3000;
  const rawSegments: SegmentInput[] = [];

  // 1. Incorporate existing walls
  const existingWallMap = new Map<string, Wall>();
  if (Array.isArray(floor.walls)) {
    for (const wall of floor.walls) {
      if (!wall.startPoint || !wall.endPoint) continue;
      existingWallMap.set(wall.id, wall);
      const len = pointDist(wall.startPoint.x, wall.startPoint.y, wall.endPoint.x, wall.endPoint.y);
      if (len < 50) continue;
      rawSegments.push({
        x1: snap(wall.startPoint.x),
        y1: snap(wall.startPoint.y),
        x2: snap(wall.endPoint.x),
        y2: snap(wall.endPoint.y),
        wallId: wall.id,
        wallUse: wall.wallUse === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL_PARTITION',
        thickness: wall.thickness ?? (wall.wallUse === 'EXTERNAL' ? 230 : 115),
      });
    }
  }

  // 2. Incorporate room polygon boundaries
  if (Array.isArray(floor.rooms)) {
    for (const room of floor.rooms) {
      let pts: Point[] = [];
      if (room.boundary?.points && room.boundary.points.length >= 3) {
        pts = room.boundary.points;
      } else if (room.width && room.height) {
        pts = [
          { x: room.x, y: room.y },
          { x: room.x + room.width, y: room.y },
          { x: room.x + room.width, y: room.y + room.height },
          { x: room.x, y: room.y + room.height },
        ];
      }

      if (pts.length < 3) continue;

      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i]!;
        const p2 = pts[(i + 1) % pts.length]!;
        const len = pointDist(p1.x, p1.y, p2.x, p2.y);
        if (len < 50) continue;

        rawSegments.push({
          x1: snap(p1.x),
          y1: snap(p1.y),
          x2: snap(p2.x),
          y2: snap(p2.y),
          roomId: room.id,
        });
      }
    }
  }

  // Group collinear segments
  type LineGroup = {
    orientation: 'H' | 'V' | 'D';
    constantVal: number;
    dirX: number;
    dirY: number;
    segments: SegmentInput[];
  };

  const lineGroups: LineGroup[] = [];

  for (const seg of rawSegments) {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.hypot(dx, dy);
    if (len < 10) continue;

    // Check if horizontal
    if (Math.abs(dy) <= 10) {
      const y = snap(seg.y1);
      let grp = lineGroups.find((g) => g.orientation === 'H' && Math.abs(g.constantVal - y) <= 15);
      if (!grp) {
        grp = { orientation: 'H', constantVal: y, dirX: 1, dirY: 0, segments: [] };
        lineGroups.push(grp);
      }
      grp.segments.push(seg);
      continue;
    }

    // Check if vertical
    if (Math.abs(dx) <= 10) {
      const x = snap(seg.x1);
      let grp = lineGroups.find((g) => g.orientation === 'V' && Math.abs(g.constantVal - x) <= 15);
      if (!grp) {
        grp = { orientation: 'V', constantVal: x, dirX: 0, dirY: 1, segments: [] };
        lineGroups.push(grp);
      }
      grp.segments.push(seg);
      continue;
    }

    // Angled / Diagonal
    const normX = dx / len;
    const normY = dy / len;
    // Canonical normal
    const d = snap(seg.x1 * -normY + seg.y1 * normX);
    let grp = lineGroups.find(
      (g) =>
        g.orientation === 'D' &&
        Math.abs(g.dirX * normX + g.dirY * normY) > 0.99 &&
        Math.abs(g.constantVal - d) <= 25
    );
    if (!grp) {
      grp = { orientation: 'D', constantVal: d, dirX: normX, dirY: normY, segments: [] };
      lineGroups.push(grp);
    }
    grp.segments.push(seg);
  }

  const synthesizedWalls: SynthesizedWall[] = [];
  let synIndex = 0;

  for (const group of lineGroups) {
    // Project all segment endpoints onto 1D line coordinate
    type Interval = {
      t1: number;
      t2: number;
      roomId?: string;
      wallId?: string;
      wallUse?: 'EXTERNAL' | 'INTERNAL_PARTITION' | 'UNIT_SEPARATION' | 'COMMON_CORRIDOR';
      thickness?: number;
    };

    const intervals: Interval[] = [];
    const criticalPointsSet = new Set<number>();

    for (const seg of group.segments) {
      let t1 = 0;
      let t2 = 0;
      if (group.orientation === 'H') {
        t1 = seg.x1;
        t2 = seg.x2;
      } else if (group.orientation === 'V') {
        t1 = seg.y1;
        t2 = seg.y2;
      } else {
        t1 = seg.x1 * group.dirX + seg.y1 * group.dirY;
        t2 = seg.x2 * group.dirX + seg.y2 * group.dirY;
      }
      const minT = snap(Math.min(t1, t2));
      const maxT = snap(Math.max(t1, t2));
      if (maxT - minT < 50) continue;

      intervals.push({
        t1: minT,
        t2: maxT,
        roomId: seg.roomId,
        wallId: seg.wallId,
        wallUse: seg.wallUse,
        thickness: seg.thickness,
      });
      criticalPointsSet.add(minT);
      criticalPointsSet.add(maxT);
    }

    const sortedCoords = Array.from(criticalPointsSet).sort((a, b) => a - b);
    if (sortedCoords.length < 2) continue;

    // Build atomic segments between consecutive critical coordinates
    type AtomicSegment = {
      tStart: number;
      tEnd: number;
      roomIds: Set<string>;
      wallId?: string;
      wallUse?: 'EXTERNAL' | 'INTERNAL_PARTITION' | 'UNIT_SEPARATION' | 'COMMON_CORRIDOR';
      thickness?: number;
    };

    const atomicSegments: AtomicSegment[] = [];

    for (let i = 0; i < sortedCoords.length - 1; i++) {
      const c1 = sortedCoords[i]!;
      const c2 = sortedCoords[i + 1]!;
      if (c2 - c1 < 40) continue;

      const mid = (c1 + c2) / 2;
      const covering = intervals.filter((iv) => iv.t1 <= mid && iv.t2 >= mid);
      if (covering.length === 0) continue;

      const roomIds = new Set<string>();
      let wallId: string | undefined;
      let wallUse: 'EXTERNAL' | 'INTERNAL_PARTITION' | 'UNIT_SEPARATION' | 'COMMON_CORRIDOR' | undefined;
      let thickness: number | undefined;

      for (const cov of covering) {
        if (cov.roomId) roomIds.add(cov.roomId);
        if (cov.wallId && !wallId) {
          wallId = cov.wallId;
          wallUse = cov.wallUse;
          thickness = cov.thickness;
        }
      }

      atomicSegments.push({
        tStart: c1,
        tEnd: c2,
        roomIds,
        wallId,
        wallUse,
        thickness,
      });
    }

    if (atomicSegments.length === 0) continue;

    // Merge adjacent atomic segments that share the same wall or classification
    let currentSpan = { ...atomicSegments[0]! };

    const flushSpan = (span: AtomicSegment) => {
      const isSharedPartition = span.roomIds.size >= 2;
      const finalWallUse = span.wallUse ?? (isSharedPartition ? 'INTERNAL_PARTITION' : 'EXTERNAL');
      const finalThickness = span.thickness ?? (finalWallUse === 'EXTERNAL' ? 230 : 115);

      let pStart: Point;
      let pEnd: Point;

      if (group.orientation === 'H') {
        pStart = { x: span.tStart, y: group.constantVal };
        pEnd = { x: span.tEnd, y: group.constantVal };
      } else if (group.orientation === 'V') {
        pStart = { x: group.constantVal, y: span.tStart };
        pEnd = { x: group.constantVal, y: span.tEnd };
      } else {
        const perpX = -group.dirY;
        const perpY = group.dirX;
        pStart = {
          x: snap(span.tStart * group.dirX + group.constantVal * perpX),
          y: snap(span.tStart * group.dirY + group.constantVal * perpY),
        };
        pEnd = {
          x: snap(span.tEnd * group.dirX + group.constantVal * perpX),
          y: snap(span.tEnd * group.dirY + group.constantVal * perpY),
        };
      }

      const id = span.wallId ?? `syn_wall_${floor.id}_${group.orientation}_${++synIndex}`;

      synthesizedWalls.push({
        id,
        floorId: floor.id,
        startPoint: pStart,
        endPoint: pEnd,
        thickness: finalThickness,
        heightMm: floorHeightMm,
        wallUse: finalWallUse,
        roomIds: Array.from(span.roomIds),
        canonicalWallId: span.wallId,
        isSynthesized: !span.wallId,
      });
    };

    for (let j = 1; j < atomicSegments.length; j++) {
      const next = atomicSegments[j]!;
      const sameWall = currentSpan.wallId && currentSpan.wallId === next.wallId;
      const bothSynthesized = !currentSpan.wallId && !next.wallId;
      const samePartitionType = (currentSpan.roomIds.size >= 2) === (next.roomIds.size >= 2);

      if ((sameWall || (bothSynthesized && samePartitionType)) && Math.abs(currentSpan.tEnd - next.tStart) <= 10) {
        currentSpan.tEnd = next.tEnd;
        for (const rid of next.roomIds) currentSpan.roomIds.add(rid);
      } else {
        flushSpan(currentSpan);
        currentSpan = { ...next };
      }
    }
    flushSpan(currentSpan);
  }

  // Safety fallback: if no walls were synthesized, preserve whatever was in floor.walls
  if (synthesizedWalls.length === 0 && Array.isArray(floor.walls)) {
    for (const w of floor.walls) {
      synthesizedWalls.push({
        id: w.id,
        floorId: floor.id,
        startPoint: w.startPoint,
        endPoint: w.endPoint,
        thickness: w.thickness ?? 230,
        heightMm: floorHeightMm,
        wallUse: w.wallUse === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL_PARTITION',
        roomIds: [...(w.roomIds ?? [])],
        canonicalWallId: w.id,
        isSynthesized: false,
      });
    }
  }

  return synthesizedWalls;
}
