import type { Building, Point } from '@ai-floor-planner/core';
import {
  type AnyNode,
  SiteNode,
  BuildingNode,
  LevelNode,
  SlabNode,
  WallNode,
  ColumnNode,
  DoorNode,
  WindowNode,
  ZoneNode,
} from '@pascal-app/core';
import { synthesizeFloorWalls, type SynthesizedWall } from './wall-synthesizer.js';

export interface PascalScene {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
}

export interface CanonicalToPascalResult {
  scene: PascalScene;
  warnings: string[];
}

export interface CanonicalToPascalOptions {
  synthesizeWalls?: boolean;
}

/**
 * Sanitizes and normalizes an identifier to Pascal's expected template prefix format.
 * (e.g. 'site_1', 'building_main', 'level_0', 'wall_ext_1')
 */
export function toPascalId(prefix: 'site' | 'building' | 'level' | 'slab' | 'wall' | 'door' | 'window' | 'zone' | 'column', rawId: string): string {
  const sanitized = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (sanitized.startsWith(`${prefix}_`)) {
    return sanitized;
  }
  return `${prefix}_${sanitized}`;
}

function safeNum(val: unknown, fallback = 0): number {
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Converts a Canonical Building Model (coordinates in mm) into a valid Pascal flat scene graph (units in meters).
 *
 * Hierarchy:
 *   Site (root)
 *     -> Building
 *          -> Level(s)
 *               -> Slab(s)
 *               -> Wall(s) -> Door(s), Window(s)
 *               -> Zone(s) (Rooms)
 *               -> Column(s)
 */
export function canonicalToPascal(building: Building, options: CanonicalToPascalOptions = {}): CanonicalToPascalResult {
  const warnings: string[] = [];
  const nodes: Record<string, AnyNode> = {};

  // 1. Site Node
  const siteId = toPascalId('site', building.site?.id ?? 'default-site');
  const sitePoints: [number, number][] = building.site?.plotBoundary?.points
    ? building.site.plotBoundary.points.map(p => [safeNum(p.x) / 1000, safeNum(p.y) / 1000] as [number, number])
    : [
      [0, 0],
      [safeNum(building.site?.plotWidth, 30000) / 1000, 0],
      [safeNum(building.site?.plotWidth, 30000) / 1000, safeNum(building.site?.plotDepth, 25000) / 1000],
      [0, safeNum(building.site?.plotDepth, 25000) / 1000],
    ];

  const siteMetadata: Record<string, unknown> = {
    canonicalId: building.site?.id ?? 'default-site',
    siteZones: building.site?.siteZones ?? [],
    accessPoints: building.site?.accessPoints ?? [],
  };

  const buildingId = toPascalId('building', building.id);

  // 2. Process Floors (Levels)
  const levelIds: string[] = [];
  let runningElevation = 0;

  const groundLevelFloor = building.floors.find(f => f.level === 0) ?? building.floors[0];
  const groundLevelId = groundLevelFloor ? toPascalId('level', groundLevelFloor.id) : undefined;

  for (let floorIdx = 0; floorIdx < building.floors.length; floorIdx++) {
    const floor = building.floors[floorIdx]!;
    const levelId = toPascalId('level', floor.id);
    levelIds.push(levelId);

    const floorHeightM = safeNum(floor.floorHeight, 3000) / 1000;
    const baseElevationM = floor.elevationMm !== undefined ? safeNum(floor.elevationMm) / 1000 : runningElevation;
    runningElevation = baseElevationM + floorHeightM;

    const levelChildren: string[] = [];

    // 2a. Slab Node
    let slabPoints: [number, number][];
    if (floor.boundary?.points && floor.boundary.points.length >= 3) {
      slabPoints = floor.boundary.points.map(
        p => [safeNum(p.x) / 1000, safeNum(p.y) / 1000] as [number, number]
      );
    } else if (floor.rooms.length > 0) {
      const xs = floor.rooms.flatMap(r => [r.x, r.x + r.width]);
      const ys = floor.rooms.flatMap(r => [r.y, r.y + r.height]);
      const minX = Math.min(...xs) / 1000;
      const maxX = Math.max(...xs) / 1000;
      const minY = Math.min(...ys) / 1000;
      const maxY = Math.max(...ys) / 1000;
      slabPoints = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
      ];
    } else {
      slabPoints = sitePoints;
    }

    const slabId = toPascalId('slab', floor.id);
    const slabNode = SlabNode.parse({
      id: slabId,
      name: `${floor.name} Slab`,
      parentId: levelId,
      polygon: slabPoints,
      thickness: safeNum(floor.slabThicknessMm, 200) / 1000,
    });
    nodes[slabId] = slabNode;
    levelChildren.push(slabId);

    // 2b. Apartment Units (groupings)
    if (floor.apartmentUnits && floor.apartmentUnits.length > 0) {
      warnings.push(
        `Floor ${floor.name} has ${floor.apartmentUnits.length} apartment unit(s) (${floor.apartmentUnits.map(u => u.id).join(', ')}). Unit boundaries mapped via zone metadata.`
      );
    }

    // 2c. Rooms -> Zones
    for (const room of floor.rooms) {
      const zoneId = toPascalId('zone', room.id);
      let zonePoints: [number, number][];

      if (room.boundary?.points && room.boundary.points.length >= 3) {
        zonePoints = room.boundary.points.map(p => [safeNum(p.x) / 1000, safeNum(p.y) / 1000] as [number, number]);
      } else {
        const x1 = safeNum(room.x) / 1000;
        const y1 = safeNum(room.y) / 1000;
        const x2 = safeNum(room.x + room.width) / 1000;
        const y2 = safeNum(room.y + room.height) / 1000;
        zonePoints = [
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
        ];
      }

      const zoneNode = ZoneNode.parse({
        id: zoneId,
        name: room.name,
        parentId: levelId,
        polygon: zonePoints,
        spaceRole: 'room',
        metadata: {
          canonicalRoomId: room.id,
          unitId: room.unitId,
          type: room.type,
          areaSqMm: room.area,
          priority: room.priority,
          ventilationRequired: room.ventilationRequired,
        },
      });

      nodes[zoneId] = zoneNode;
      levelChildren.push(zoneId);
    }

    // 2d. Walls and Wall-Hosted Openings
    const shouldSynthesize = options.synthesizeWalls !== false;
    const synthesizedWalls: SynthesizedWall[] = shouldSynthesize
      ? synthesizeFloorWalls(floor)
      : (floor.walls ?? []).map(w => ({
        id: w.id,
        floorId: floor.id,
        startPoint: w.startPoint,
        endPoint: w.endPoint,
        thickness: w.thickness ?? 230,
        heightMm: floor.floorHeight ?? 3000,
        wallUse: w.wallUse === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL_PARTITION',
        roomIds: [...(w.roomIds ?? [])],
        canonicalWallId: w.id,
        isSynthesized: false,
      }));

    const floorWallMap = new Map<string, string>(); // canonical / syn wall id -> pascal wall id
    const wallChildrenMap = new Map<string, string[]>(); // pascal wall id -> opening ids

    for (const wall of synthesizedWalls) {
      const wallId = toPascalId('wall', wall.id);
      if (wall.canonicalWallId) {
        floorWallMap.set(wall.canonicalWallId, wallId);
      }
      floorWallMap.set(wall.id, wallId);
      wallChildrenMap.set(wallId, []);
    }

    const findHostWallForOpening = (hostWallId: string | undefined, pos: Point | undefined) => {
      if (hostWallId) {
        const mappedId = floorWallMap.get(hostWallId);
        if (mappedId) {
          const w = synthesizedWalls.find(sw => toPascalId('wall', sw.id) === mappedId);
          if (w) return { pascalWallId: mappedId, hostWall: w };
        }
      }
      if (pos && synthesizedWalls.length > 0) {
        let bestWall: SynthesizedWall | undefined;
        let minDist = Infinity;
        for (const w of synthesizedWalls) {
          const dx = (w.endPoint.x - w.startPoint.x) / 1000;
          const dy = (w.endPoint.y - w.startPoint.y) / 1000;
          const len = Math.hypot(dx, dy);
          if (len < 0.05) continue;
          const vx = (pos.x - w.startPoint.x) / 1000;
          const vy = (pos.y - w.startPoint.y) / 1000;
          const t = Math.max(0, Math.min(len, (vx * dx + vy * dy) / len));
          const px = (w.startPoint.x / 1000) + (t * dx) / len;
          const py = (w.startPoint.y / 1000) + (t * dy) / len;
          const d = Math.hypot((pos.x / 1000) - px, (pos.y / 1000) - py);
          if (d < minDist) {
            minDist = d;
            bestWall = w;
          }
        }
        if (bestWall && minDist < 3.0) {
          const mappedId = toPascalId('wall', bestWall.id);
          return { pascalWallId: mappedId, hostWall: bestWall };
        }
      }
      return null;
    };

    // Doors
    for (const door of floor.doors) {
      const matched = findHostWallForOpening(door.wallId, door.position);

      if (matched) {
        const { pascalWallId, hostWall } = matched;
        const doorId = toPascalId('door', door.id);
        const hx1 = safeNum(hostWall.startPoint?.x, 0);
        const hy1 = safeNum(hostWall.startPoint?.y, 0);
        const hx2 = safeNum(hostWall.endPoint?.x, 0);
        const hy2 = safeNum(hostWall.endPoint?.y, 0);
        const dx = (hx2 - hx1) / 1000;
        const dy = (hy2 - hy1) / 1000;
        const dpx = safeNum(door.position?.x, hx1);
        const dpy = safeNum(door.position?.y, hy1);
        const vx = (dpx - hx1) / 1000;
        const vy = (dpy - hy1) / 1000;
        const wallLen = Math.hypot(dx, dy);
        const rawS = wallLen > 0 ? (vx * dx + vy * dy) / wallLen : 0;
        const s = safeNum(rawS, 0);
        const doorWidthM = safeNum(door.width, 900) / 1000;
        const clampedS = wallLen > 0 ? Math.max(0.1, Math.min(Math.max(0.1, wallLen - doorWidthM - 0.1), s)) : 0;

        const doorNode = DoorNode.parse({
          id: doorId,
          name: `Door ${door.id}`,
          parentId: pascalWallId,
          wallId: pascalWallId,
          position: [safeNum(clampedS, 0), 0, 0],
          width: doorWidthM,
          height: safeNum(door.height, 2100) / 1000,
          metadata: {
            canonicalId: door.id,
            doorType: door.type,
            swingDirection: door.swingDirection,
            connectsRooms: door.connectsRooms,
          },
        });

        nodes[doorId] = doorNode;
        wallChildrenMap.get(pascalWallId)?.push(doorId);
      } else {
        warnings.push(`Door ${door.id} references wall ${door.wallId} which was not found on floor ${floor.id}.`);
      }
    }

    // Windows
    for (const win of floor.windows) {
      const matched = findHostWallForOpening(win.wallId, win.position);

      if (matched) {
        const { pascalWallId, hostWall } = matched;
        const winId = toPascalId('window', win.id);
        const hx1 = safeNum(hostWall.startPoint?.x, 0);
        const hy1 = safeNum(hostWall.startPoint?.y, 0);
        const hx2 = safeNum(hostWall.endPoint?.x, 0);
        const hy2 = safeNum(hostWall.endPoint?.y, 0);
        const dx = (hx2 - hx1) / 1000;
        const dy = (hy2 - hy1) / 1000;
        const wpx = safeNum(win.position?.x, hx1);
        const wpy = safeNum(win.position?.y, hy1);
        const vx = (wpx - hx1) / 1000;
        const vy = (wpy - hy1) / 1000;
        const wallLen = Math.hypot(dx, dy);
        const rawS = wallLen > 0 ? (vx * dx + vy * dy) / wallLen : 0;
        const s = safeNum(rawS, 0);
        const winWidthM = safeNum(win.width, 1200) / 1000;
        const clampedS = wallLen > 0 ? Math.max(0.1, Math.min(Math.max(0.1, wallLen - winWidthM - 0.1), s)) : 0;
        const sillM = safeNum(win.sillHeight, 900) / 1000;

        const winNode = WindowNode.parse({
          id: winId,
          name: `Window ${win.id}`,
          parentId: pascalWallId,
          wallId: pascalWallId,
          position: [safeNum(clampedS, 0), safeNum(sillM, 0.9), 0],
          width: winWidthM,
          height: safeNum(win.height, 1200) / 1000,
          sillHeight: safeNum(sillM, 0.9),
          metadata: {
            canonicalId: win.id,
            windowType: win.type,
            roomId: win.roomId,
          },
        });

        nodes[winId] = winNode;
        wallChildrenMap.get(pascalWallId)?.push(winId);
      } else {
        warnings.push(`Window ${win.id} references wall ${win.wallId} which was not found on floor ${floor.id}.`);
      }
    }

    // Walls node creation
    for (const wall of synthesizedWalls) {
      const wallId = toPascalId('wall', wall.id);
      const children = wallChildrenMap.get(wallId) ?? [];

      const wallNode = WallNode.parse({
        id: wallId,
        name: wall.isSynthesized ? `Partition ${wall.id}` : `Wall ${wall.id}`,
        parentId: levelId,
        start: [safeNum(wall.startPoint.x) / 1000, safeNum(wall.startPoint.y) / 1000],
        end: [safeNum(wall.endPoint.x) / 1000, safeNum(wall.endPoint.y) / 1000],
        thickness: safeNum(wall.thickness, 230) / 1000,
        height: floorHeightM,
        children,
        metadata: {
          canonicalId: wall.canonicalWallId ?? wall.id,
          wallUse: wall.wallUse,
          roomIds: wall.roomIds,
          isSynthesized: wall.isSynthesized,
        },
      });

      nodes[wallId] = wallNode;
      levelChildren.push(wallId);
    }

    // 2e. Columns
    if (floor.columns) {
      for (const col of floor.columns) {
        const colId = toPascalId('column', col.id);
        const colWidthM = safeNum(col.width, 300) / 1000;
        const colDepthM = safeNum(col.depth, 300) / 1000;

        const colNode = ColumnNode.parse({
          id: colId,
          name: `Column ${col.id}`,
          parentId: levelId,
          position: [safeNum(col.position.x) / 1000, 0, safeNum(col.position.y) / 1000],
          width: colWidthM,
          depth: colDepthM,
          height: floorHeightM,
          crossSection: 'rectangular',
          metadata: {
            canonicalId: col.id,
            isStructural: col.isStructural,
            gridReference: col.gridReference,
          },
        });

        nodes[colId] = colNode;
        levelChildren.push(colId);
      }
    }

    // 2f. Stairs (mapped to visible stepped architectural slab nodes)
    if (floor.stairs && floor.stairs.length > 0) {
      for (const stair of floor.stairs) {
        const stairId = toPascalId('slab', `stair_${stair.id}`);
        let stairPoints: [number, number][];
        if (stair.boundary?.points && stair.boundary.points.length >= 3) {
          stairPoints = stair.boundary.points.map(p => [safeNum(p.x) / 1000, safeNum(p.y) / 1000] as [number, number]);
        } else {
          const sx = safeNum(stair.x, 0) / 1000;
          const sy = safeNum(stair.y, 0) / 1000;
          const sw = safeNum(stair.width, 1200) / 1000;
          const sl = safeNum(stair.length, 3000) / 1000;
          stairPoints = [
            [sx, sy],
            [sx + sw, sy],
            [sx + sw, sy + sl],
            [sx, sy + sl],
          ];
        }

        const stairSlab = SlabNode.parse({
          id: stairId,
          name: `Stair Core ${stair.id}`,
          parentId: levelId,
          polygon: stairPoints,
          thickness: Math.max(0.15, floorHeightM * 0.4),
          metadata: {
            canonicalId: stair.id,
            elementKind: 'staircase',
            stairType: stair.type ?? 'dog-legged',
            risers: stair.riserCount ?? 18,
            treadDepthMm: stair.treadDepth ?? 250,
          },
        });

        nodes[stairId] = stairSlab;
        levelChildren.push(stairId);
      }
    }

    // 2g. Level Node Creation
    const levelNode = LevelNode.parse({
      id: levelId,
      name: floor.name,
      parentId: buildingId,
      level: floor.level,
      baseElevation: baseElevationM,
      height: floorHeightM,
      children: levelChildren,
    });

    nodes[levelId] = levelNode;
  }

  // Compute 3D bounding box across all walls and slabs
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const node of Object.values(nodes)) {
    if (node.type === 'wall' && 'start' in node && 'end' in node) {
      const w = node as any;
      minX = Math.min(minX, safeNum(w.start[0]), safeNum(w.end[0]));
      maxX = Math.max(maxX, safeNum(w.start[0]), safeNum(w.end[0]));
      minY = Math.min(minY, safeNum(w.start[1]), safeNum(w.end[1]));
      maxY = Math.max(maxY, safeNum(w.start[1]), safeNum(w.end[1]));
    } else if (node.type === 'slab' && 'polygon' in node) {
      const s = node as any;
      for (const pt of s.polygon ?? []) {
        minX = Math.min(minX, safeNum(pt[0]));
        maxX = Math.max(maxX, safeNum(pt[0]));
        minY = Math.min(minY, safeNum(pt[1]));
        maxY = Math.max(maxY, safeNum(pt[1]));
      }
    }
  }
  if (!Number.isFinite(minX)) { minX = 0; maxX = 30; minY = 0; maxY = 25; }

  // 3. Building Node
  const buildingNode = BuildingNode.parse({
    id: buildingId,
    name: building.name,
    parentId: siteId,
    groundLevelId,
    children: levelIds,
    metadata: {
      canonicalId: building.id,
      projectId: building.projectId,
      version: building.version,
      bounds: {
        min: [minX, 0, minY],
        max: [maxX, runningElevation, maxY],
      },
      camera: {
        target: [(minX + maxX) / 2, runningElevation / 2, (minY + maxY) / 2],
        distance: Math.max(maxX - minX, maxY - minY, runningElevation) * 1.5,
      },
    },
  });
  nodes[buildingId] = buildingNode;

  // 4. Site Node
  const siteNode = SiteNode.parse({
    id: siteId,
    name: building.site?.id ?? 'Site',
    polygon: {
      type: 'polygon',
      points: sitePoints,
    },
    children: [buildingId],
    metadata: siteMetadata,
  });
  nodes[siteId] = siteNode;

  return {
    scene: {
      nodes,
      rootNodeIds: [siteId],
    },
    warnings,
  };
}
