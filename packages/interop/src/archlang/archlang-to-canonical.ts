import type { Building, Room, Wall, Door, Window } from '@ai-floor-planner/core';
import { WallType, DoorType, WindowType, RoomType, SwingDirection } from '@ai-floor-planner/core';

function mapUseToRoomType(use: string): RoomType {
  const u = (use || '').toLowerCase().trim();
  switch (u) {
    case 'living':
      return RoomType.Living;
    case 'bed':
    case 'bedroom':
      return RoomType.Bedroom;
    case 'kitchen':
      return RoomType.Kitchen;
    case 'dining':
      return RoomType.Dining;
    case 'bath':
    case 'bathroom':
    case 'toilet':
      return RoomType.Bathroom;
    case 'office':
    case 'study':
      return RoomType.Study;
    case 'garage':
    case 'parking':
      return RoomType.Parking;
    case 'entry':
    case 'foyer':
      return RoomType.Foyer;
    case 'circulation':
    case 'corridor':
      return RoomType.Corridor;
    case 'balcony':
      return RoomType.Balcony;
    case 'terrace':
      return RoomType.Terrace;
    case 'utility':
      return RoomType.Utility;
    default:
      return RoomType.Living;
  }
}

export interface ParsedArchLangRoom {
  id: string;
  name: string;
  use: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParsedArchLangWall {
  id: string;
  kind: 'exterior' | 'partition';
  thickness: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface ParsedArchLangDoor {
  id: string;
  wallId: string;
  offset: number;
  width: number;
}

export interface ParsedArchLangWindow {
  id: string;
  wallId: string;
  offset: number;
  width: number;
}

/**
 * Parses .arch DSL source code into structured 2D elements.
 */
export function parseArchLangSource(source: string): {
  rooms: ParsedArchLangRoom[];
  walls: ParsedArchLangWall[];
  doors: ParsedArchLangDoor[];
  windows: ParsedArchLangWindow[];
} {
  const rooms: ParsedArchLangRoom[] = [];
  const walls: ParsedArchLangWall[] = [];
  const doors: ParsedArchLangDoor[] = [];
  const windows: ParsedArchLangWindow[] = [];

  const lines = source.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Room: room id=living at (1000, 1500) size 4000x4800 label "Living Room" uses living
    const roomMatch = line.match(
      /room\s+(?:id=)?([a-zA-Z0-9_\-]+)\s+at\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s+size\s+(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s+label\s+"([^"]*)")?(?:\s+uses\s+([a-zA-Z0-9_\-]+))?/i,
    );
    if (roomMatch) {
      rooms.push({
        id: roomMatch[1]!,
        x: Math.round(Number(roomMatch[2])),
        y: Math.round(Number(roomMatch[3])),
        width: Math.round(Number(roomMatch[4])),
        height: Math.round(Number(roomMatch[5])),
        name: roomMatch[6] || roomMatch[1]!,
        use: roomMatch[7] || 'living',
      });
      continue;
    }

    // Wall: wall id=w1 exterior thickness 230 { (1000, 1500) (8144, 1500) }
    const wallMatch = line.match(
      /wall\s+(?:id=)?([a-zA-Z0-9_\-]+)\s+(exterior|partition|interior)?\s*(?:thickness\s+(\d+(?:\.\d+)?))?\s*\{\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*\}/i,
    );
    if (wallMatch) {
      walls.push({
        id: wallMatch[1]!,
        kind: (wallMatch[2]?.toLowerCase() === 'exterior' ? 'exterior' : 'partition'),
        thickness: Math.round(Number(wallMatch[3] || 115)),
        startX: Math.round(Number(wallMatch[4])),
        startY: Math.round(Number(wallMatch[5])),
        endX: Math.round(Number(wallMatch[6])),
        endY: Math.round(Number(wallMatch[7])),
      });
      continue;
    }

    // Door: door id=d1 on w1 at 500 width 900
    const doorMatch = line.match(
      /door\s+(?:id=)?([a-zA-Z0-9_\-]+)\s+on\s+([a-zA-Z0-9_\-]+)\s+at\s+(\d+(?:\.\d+)?)\s+width\s+(\d+(?:\.\d+)?)/i,
    );
    if (doorMatch) {
      doors.push({
        id: doorMatch[1]!,
        wallId: doorMatch[2]!,
        offset: Math.round(Number(doorMatch[3])),
        width: Math.round(Number(doorMatch[4])),
      });
      continue;
    }

    // Window: window id=win1 on w1 at 800 width 1200
    const winMatch = line.match(
      /window\s+(?:id=)?([a-zA-Z0-9_\-]+)\s+on\s+([a-zA-Z0-9_\-]+)\s+at\s+(\d+(?:\.\d+)?)\s+width\s+(\d+(?:\.\d+)?)/i,
    );
    if (winMatch) {
      windows.push({
        id: winMatch[1]!,
        wallId: winMatch[2]!,
        offset: Math.round(Number(winMatch[3])),
        width: Math.round(Number(winMatch[4])),
      });
    }
  }

  return { rooms, walls, doors, windows };
}

function normalizeMatchId(id: string): string {
  return (id || '').replace(/[-_]/g, '').toLowerCase();
}

/**
 * Patches a Canonical Building Model's floor with modifications from edited ArchLang (.arch DSL or compiled AST).
 */
export function archLangToCanonicalPatch(
  archLangData: string | { rooms?: any[]; walls?: any[]; doors?: any[]; windows?: any[] },
  floorId: string,
  baseBuilding: Building,
): Building {
  const cloned: any = JSON.parse(JSON.stringify(baseBuilding));
  cloned.version = (cloned.version ?? 1) + 1;
  cloned.updatedAt = new Date().toISOString();
  if (!cloned.metadata) cloned.metadata = {};
  cloned.metadata.lastEditedBy = '2d';
  cloned.metadata.last2dSyncAt = new Date().toISOString();

  let floor = cloned.floors.find((f: any) => f.id === floorId);
  if (!floor && cloned.floors.length === 1) {
    floor = cloned.floors[0];
  }
  if (!floor) return cloned as Building;

  let parsed: {
    rooms: ParsedArchLangRoom[];
    walls: ParsedArchLangWall[];
    doors: ParsedArchLangDoor[];
    windows: ParsedArchLangWindow[];
  };

  if (typeof archLangData === 'string') {
    parsed = parseArchLangSource(archLangData);
  } else {
    parsed = {
      rooms: (archLangData.rooms || []).map((r: any) => ({
        id: r.id,
        name: r.name || r.id,
        use: r.use || r.type || 'living',
        x: r.x || r.bounds?.x || 0,
        y: r.y || r.bounds?.y || 0,
        width: r.width || r.bounds?.width || 3000,
        height: r.height || r.bounds?.height || 3000,
      })),
      walls: (archLangData.walls || []).map((w: any) => ({
        id: w.id,
        kind: w.kind || (w.thickness >= 200 ? 'exterior' : 'partition'),
        thickness: w.thickness || 115,
        startX: w.startX ?? w.startPoint?.x ?? 0,
        startY: w.startY ?? w.startPoint?.y ?? 0,
        endX: w.endX ?? w.endPoint?.x ?? 0,
        endY: w.endY ?? w.endPoint?.y ?? 0,
      })),
      doors: (archLangData.doors || []).map((d: any) => ({
        id: d.id,
        wallId: d.wallId,
        offset: d.offset ?? 500,
        width: d.width ?? 900,
      })),
      windows: (archLangData.windows || []).map((w: any) => ({
        id: w.id,
        wallId: w.wallId,
        offset: w.offset ?? 500,
        width: w.width ?? 1200,
      })),
    };
  }

  // 1. Update Rooms
  if (parsed.rooms.length > 0) {
    const updatedRooms: Room[] = [];

    for (const pr of parsed.rooms) {
      const existing = floor.rooms?.find(
        (r: any) => r.id === pr.id || normalizeMatchId(r.id) === normalizeMatchId(pr.id),
      );
      const points = [
        { x: pr.x, y: pr.y },
        { x: pr.x + pr.width, y: pr.y },
        { x: pr.x + pr.width, y: pr.y + pr.height },
        { x: pr.x, y: pr.y + pr.height },
      ];

      updatedRooms.push({
        id: existing?.id || pr.id,
        floorId: floor.id,
        unitId: existing?.unitId,
        name: pr.name || existing?.name || 'Room',
        type: mapUseToRoomType(pr.use) || existing?.type || RoomType.Living,
        x: pr.x,
        y: pr.y,
        width: pr.width,
        height: pr.height,
        area: pr.width * pr.height,
        rotation: existing?.rotation ?? 0,
        priority: existing?.priority ?? 1,
        tags: existing?.tags || [],
        adjacencyRequirements: existing?.adjacencyRequirements || [],
        daylightRequirement: existing?.daylightRequirement || (1 as any),
        privacyRequirement: existing?.privacyRequirement || (1 as any),
        ventilationRequired: existing?.ventilationRequired ?? true,
        isFixed: existing?.isFixed ?? false,
        boundary: { points },
      });
    }

    floor.rooms = updatedRooms;
  }

  // 2. Update Walls
  if (parsed.walls.length > 0) {
    const updatedWalls: Wall[] = [];

    for (const pw of parsed.walls) {
      const existing = floor.walls?.find(
        (w: any) => w.id === pw.id || normalizeMatchId(w.id) === normalizeMatchId(pw.id),
      );
      const isExt = pw.kind === 'exterior' || pw.thickness >= 200;

      updatedWalls.push({
        id: existing?.id || pw.id,
        floorId: floor.id,
        startPoint: { x: pw.startX, y: pw.startY },
        endPoint: { x: pw.endX, y: pw.endY },
        thickness: pw.thickness,
        heightMm: existing?.heightMm || 3000,
        type: isExt ? WallType.External : WallType.Internal,
        wallUse: isExt ? 'EXTERNAL' : 'INTERNAL_PARTITION',
        roomIds: existing?.roomIds || [],
        unitIds: existing?.unitIds || [],
        hasOpening: existing?.hasOpening ?? false,
        loadBearing: existing?.loadBearing ?? isExt,
      });
    }

    floor.walls = updatedWalls;
  }

  // 3. Update Doors
  if (parsed.doors.length > 0) {
    const updatedDoors: Door[] = [];

    for (const pd of parsed.doors) {
      const existing = floor.doors?.find(
        (d: any) => d.id === pd.id || normalizeMatchId(d.id) === normalizeMatchId(pd.id),
      );
      const hostWall = floor.walls?.find(
        (w: any) => w.id === pd.wallId || normalizeMatchId(w.id) === normalizeMatchId(pd.wallId),
      );

      let pos = existing?.position || { x: 0, y: 0 };
      if (hostWall) {
        const dx = hostWall.endPoint.x - hostWall.startPoint.x;
        const dy = hostWall.endPoint.y - hostWall.startPoint.y;
        const len = Math.hypot(dx, dy);
        const ratio = len > 0 ? pd.offset / len : 0;
        pos = {
          x: Math.round(hostWall.startPoint.x + dx * ratio),
          y: Math.round(hostWall.startPoint.y + dy * ratio),
        };
      }

      const connects: readonly [string, string] = existing?.connectsRooms && existing.connectsRooms.length >= 2
        ? existing.connectsRooms
        : ['__outside__', existing?.connectsRooms?.[0] || '__outside__'];

      updatedDoors.push({
        id: existing?.id || pd.id,
        floorId: floor.id,
        wallId: hostWall?.id || pd.wallId,
        position: pos,
        width: pd.width,
        height: existing?.height || 2100,
        type: existing?.type || DoorType.Single,
        swingDirection: existing?.swingDirection || SwingDirection.Inward,
        connectsRooms: connects,
      });
    }

    floor.doors = updatedDoors;
  }

  // 4. Update Windows
  if (parsed.windows.length > 0) {
    const updatedWindows: Window[] = [];

    for (const pw of parsed.windows) {
      const existing = floor.windows?.find((w: any) => w.id === pw.id || w.id.replace(/[^a-zA-Z0-9_-]/g, '_') === pw.id);
      const hostWall = floor.walls?.find((w: any) => w.id === pw.wallId || w.id.replace(/[^a-zA-Z0-9_-]/g, '_') === pw.wallId);

      let pos = existing?.position || { x: 0, y: 0 };
      if (hostWall) {
        const dx = hostWall.endPoint.x - hostWall.startPoint.x;
        const dy = hostWall.endPoint.y - hostWall.startPoint.y;
        const len = Math.hypot(dx, dy);
        const ratio = len > 0 ? pw.offset / len : 0;
        pos = {
          x: Math.round(hostWall.startPoint.x + dx * ratio),
          y: Math.round(hostWall.startPoint.y + dy * ratio),
        };
      }

      updatedWindows.push({
        id: existing?.id || pw.id,
        floorId: floor.id,
        wallId: hostWall?.id || pw.wallId,
        position: pos,
        width: pw.width,
        height: existing?.height || 1200,
        sillHeight: existing?.sillHeight || 900,
        type: existing?.type || WindowType.Casement,
        roomId: existing?.roomId || '',
      });
    }

    floor.windows = updatedWindows;
  }

  return cloned as Building;
}
