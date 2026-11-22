import { type Building, RoomType, WallType, SwingDirection } from '@ai-floor-planner/core';
import {
  compile,
  finish,
  lint,
  toDxf,
  toPdf,
  impact,
  type ImpactReport,
} from '@chanmeng666/archlang';

export interface CanonicalToArchLangOptions {
  includeAutoDimensions?: boolean;
  showDimensions?: boolean;
  includeStairs?: boolean;
  includeColumns?: boolean;
  lockedRoomIds?: string[];
}

export interface CompileArchLangOptions extends CanonicalToArchLangOptions {
  autoFurnish?: boolean;
  circulationOverlay?: boolean;
  format?: 'svg' | 'dxf' | 'pdf' | 'arch';
}

export interface ArchLangDiagnostic {
  message: string;
  line?: number;
  col?: number;
  code?: string;
}

export interface ArchLangValidationResult {
  valid: boolean;
  errors: ArchLangDiagnostic[];
  warnings: ArchLangDiagnostic[];
  diagnostics?: any[];
}

export interface ArchLangRoomInfo {
  id: string;
  archId: string;
  name: string;
  type: string;
  areaMm2: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  locked: boolean;
}

export interface ArchLangFloorStats {
  roomCount: number;
  wallCount: number;
  doorCount: number;
  windowCount: number;
  columnCount: number;
  stairCount: number;
  totalAreaMm2: number;
  lockedRoomCount: number;
  lockedAreaMm2: number;
}

export interface CompileCanonicalFloorResult {
  source: string;
  svg: string;
  dxf?: string;
  pdf?: Uint8Array;
  validation: ArchLangValidationResult;
  warnings: string[];
  roomMap: Record<string, ArchLangRoomInfo>;
  stats: ArchLangFloorStats;
}

export interface RoomLockImpactAnalysis {
  floorId: string;
  method: 'ARCHLANG_NATIVE_IMPACT' | 'TOPOLOGICAL_ADJACENCY_GRAPH';
  lockedRoomIds: string[];
  lockedRooms: ArchLangRoomInfo[];
  adjacentRoomIds: string[];
  adjacentRooms: ArchLangRoomInfo[];
  boundaryWallIds: string[];
  connectedDoorIds: string[];
  totalRooms: number;
  lockedCount: number;
  totalFloorAreaMm2: number;
  lockedAreaMm2: number;
  flexibleAreaMm2: number;
  lockedAreaRatio: number;
  targetAssessment?: {
    targetRoomId: string;
    status: 'LOCKED' | 'CONSTRAINED' | 'FREE';
    reason: string;
  };
  nativeImpact?: ImpactReport;
}

/**
 * Sanitizes an ID into a clean ArchLang identifier (alphanumeric and underscore).
 */
export function toArchLangId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Maps a Canonical Building Model RoomType into an ArchLang standard usage kind.
 */
export function mapRoomUse(type: RoomType | string): string {
  switch (type) {
    case RoomType.Living:
    case RoomType.FamilyLiving:
    case RoomType.Drawing:
      return 'living';
    case RoomType.Bedroom:
    case RoomType.ServantQuarter:
      return 'bedroom';
    case RoomType.Kitchen:
      return 'kitchen';
    case RoomType.Dining:
      return 'dining';
    case RoomType.Bathroom:
    case RoomType.Dressing:
      return 'bath';
    case RoomType.Utility:
    case RoomType.Balcony:
    case RoomType.Terrace:
    case RoomType.Garden:
      return 'utility';
    case RoomType.Storage:
      return 'storage';
    case RoomType.Foyer:
      return 'entry';
    case RoomType.Corridor:
    case RoomType.Staircase:
    case RoomType.Lift:
    case RoomType.ServiceShaft:
      return 'circulation';
    case RoomType.Study:
      return 'office';
    case RoomType.Parking:
      return 'garage';
    default:
      return 'utility';
  }
}

/**
 * Serializes a selected floor from a Canonical Building Model into valid ArchLang (.arch) DSL source code.
 */
export function canonicalToArchLang(
  building: Building,
  floorId: string,
  options: CanonicalToArchLangOptions = {}
): string {
  const floor = building.floors.find((f) => f.id === floorId);
  if (!floor) {
    throw new Error(`Floor "${floorId}" not found in building "${building.name}" (${building.id}).`);
  }

  const lockedIds = new Set(options.lockedRoomIds ?? []);
  const lines: string[] = [];
  lines.push(`plan "${building.name} - ${floor.name}" {`);
  lines.push(`  units mm`);

  if (options.includeAutoDimensions || options.showDimensions) {
    lines.push(`  dims auto all`);
  }

  lines.push('');
  lines.push('  # Rooms');
  for (const room of floor.rooms) {
    const rId = toArchLangId(room.id);
    const isLocked = lockedIds.has(room.id) || lockedIds.has(rId);
    const use = mapRoomUse(room.type);
    const label = (room.name || room.type).replace(/"/g, "'");
    const lockComment = isLocked ? ' # [ROOM_LOCK: LOCKED]' : '';
    lines.push(
      `  room id=${rId} at (${room.x}, ${room.y}) size ${room.width}x${room.height} label "${label}" uses ${use}${lockComment}`
    );
  }

  lines.push('');
  lines.push('  # Walls');
  for (const wall of floor.walls) {
    const wId = toArchLangId(wall.id);
    const kind = wall.type === WallType.External ? 'exterior' : 'partition';
    lines.push(
      `  wall id=${wId} ${kind} thickness ${wall.thickness} { (${wall.startPoint.x}, ${wall.startPoint.y}) (${wall.endPoint.x}, ${wall.endPoint.y}) }`
    );
  }

  lines.push('');
  lines.push('  # Doors');
  for (const door of floor.doors) {
    const hostWall = floor.walls.find((w) => w.id === door.wallId);
    if (!hostWall) continue;

    const dId = toArchLangId(door.id);
    const wId = toArchLangId(hostWall.id);

    const dx = hostWall.endPoint.x - hostWall.startPoint.x;
    const dy = hostWall.endPoint.y - hostWall.startPoint.y;
    const vx = door.position.x - hostWall.startPoint.x;
    const vy = door.position.y - hostWall.startPoint.y;
    const wallLen = Math.hypot(dx, dy);
    const offset = wallLen > 0 ? Math.round(Math.max(0, Math.min(wallLen, (vx * dx + vy * dy) / wallLen))) : 0;

    const swing =
      door.swingDirection === SwingDirection.Inward
        ? ' swing in'
        : door.swingDirection === SwingDirection.Outward
          ? ' swing out'
          : '';

    lines.push(`  door id=${dId} on ${wId} at ${offset} width ${door.width}${swing}`);
  }

  lines.push('');
  lines.push('  # Windows');
  for (const win of floor.windows) {
    const hostWall = floor.walls.find((w) => w.id === win.wallId);
    if (!hostWall) continue;

    const winId = toArchLangId(win.id);
    const wId = toArchLangId(hostWall.id);

    const dx = hostWall.endPoint.x - hostWall.startPoint.x;
    const dy = hostWall.endPoint.y - hostWall.startPoint.y;
    const vx = win.position.x - hostWall.startPoint.x;
    const vy = win.position.y - hostWall.startPoint.y;
    const wallLen = Math.hypot(dx, dy);
    const offset = wallLen > 0 ? Math.round(Math.max(0, Math.min(wallLen, (vx * dx + vy * dy) / wallLen))) : 0;

    lines.push(`  window id=${winId} on ${wId} at ${offset} width ${win.width}`);
  }

  if (options.includeColumns !== false && floor.columns && floor.columns.length > 0) {
    lines.push('');
    lines.push('  # Columns');
    for (const col of floor.columns) {
      const colId = toArchLangId(col.id);
      const w = col.width ?? 300;
      const d = col.depth ?? 300;
      lines.push(`  column id=${colId} at (${col.position.x}, ${col.position.y}) size ${w}x${d}`);
    }
  }

  if (options.includeStairs !== false && floor.stairs && floor.stairs.length > 0) {
    lines.push('');
    lines.push('  # Stairs');
    for (const stair of floor.stairs) {
      const sId = toArchLangId(stair.id);
      const w = stair.length ?? 4000;
      const h = stair.width ?? 2400;
      const flightW = stair.landingWidth ?? 1200;
      lines.push(`  stair id=${sId} at (${stair.x}, ${stair.y}) size ${w}x${h} dir up width ${flightW}`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

/**
 * Validates ArchLang source code and returns diagnostics.
 */
export function validateArchLang(source: string): ArchLangValidationResult {
  const compileRes = compile(source);
  const lintDiagnostics = lint(source) as ArchLangDiagnostic[] | undefined;

  const errors = (compileRes.errors ?? []).map((e: any) => ({
    message: typeof e === 'string' ? e : e.message ?? String(e),
    line: e.line,
    col: e.col,
    code: e.code,
  }));

  const warnings = (compileRes.warnings ?? []).map((w: any) => ({
    message: typeof w === 'string' ? w : w.message ?? String(w),
    line: w.line,
    col: w.col,
    code: w.code,
  }));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    diagnostics: lintDiagnostics,
  };
}

/**
 * Computes room metadata and stats from canonical floor data.
 */
function computeRoomMapAndStats(
  building: Building,
  floorId: string,
  lockedRoomIds?: string[]
): { roomMap: Record<string, ArchLangRoomInfo>; stats: ArchLangFloorStats } {
  const floor = building.floors.find((f) => f.id === floorId);
  if (!floor) {
    throw new Error(`Floor "${floorId}" not found in building "${building.name}" (${building.id}).`);
  }

  const lockedSet = new Set(lockedRoomIds ?? []);
  const roomMap: Record<string, ArchLangRoomInfo> = {};
  let totalAreaMm2 = 0;
  let lockedAreaMm2 = 0;
  let lockedRoomCount = 0;

  for (const room of floor.rooms) {
    const archId = toArchLangId(room.id);
    const locked = lockedSet.has(room.id) || lockedSet.has(archId);
    const area = (room.width || 0) * (room.height || 0);
    totalAreaMm2 += area;
    if (locked) {
      lockedAreaMm2 += area;
      lockedRoomCount++;
    }

    roomMap[room.id] = {
      id: room.id,
      archId,
      name: room.name || room.type,
      type: room.type,
      areaMm2: area,
      bounds: {
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
      },
      locked,
    };
  }

  const stats: ArchLangFloorStats = {
    roomCount: floor.rooms.length,
    wallCount: floor.walls.length,
    doorCount: floor.doors.length,
    windowCount: floor.windows.length,
    columnCount: floor.columns?.length ?? 0,
    stairCount: floor.stairs?.length ?? 0,
    totalAreaMm2,
    lockedRoomCount,
    lockedAreaMm2,
  };

  return { roomMap, stats };
}

/**
 * Compiles a selected canonical floor with ArchLang synchronously entirely in-process (zero subprocesses),
 * supporting optional auto-furnishing, circulation overlay, auto-dimensions, and DXF generation.
 */
export function compileCanonicalFloorWithArchLang(
  building: Building,
  floorId: string,
  options: CompileArchLangOptions = {}
): CompileCanonicalFloorResult {
  const warnings: string[] = [];
  const { roomMap, stats } = computeRoomMapAndStats(building, floorId, options.lockedRoomIds);

  let source = canonicalToArchLang(building, floorId, options);

  if (options.autoFurnish) {
    try {
      const finishRes = finish(source);
      if (finishRes && finishRes.source) {
        source = finishRes.source;
      }
    } catch (err: any) {
      warnings.push(`ArchLang auto-furnish finish step reported: ${err.message ?? String(err)}`);
    }
  }

  const compileOptions: any = {};
  if (options.circulationOverlay) {
    compileOptions.overlays = ['circulation'];
  }

  const compileRes = compile(source, compileOptions);
  const validation = validateArchLang(source);

  let dxf: string | undefined;
  if (options.format === 'dxf' && compileRes.scene) {
    try {
      dxf = toDxf(compileRes.scene);
    } catch (err: any) {
      warnings.push(`ArchLang toDxf conversion error: ${err.message ?? String(err)}`);
    }
  }

  if (options.format === 'pdf') {
    warnings.push(
      'PDF compilation is asynchronous. Use compileCanonicalFloorWithArchLangAsync() to obtain in-process PDF output.'
    );
  }

  return {
    source,
    svg: compileRes.svg ?? '',
    dxf,
    validation,
    warnings,
    roomMap,
    stats,
  };
}

/**
 * Compiles a selected canonical floor with ArchLang asynchronously in-process,
 * allowing PDF rendering via pdfkit in addition to SVG, DXF, and .arch DSL.
 */
export async function compileCanonicalFloorWithArchLangAsync(
  building: Building,
  floorId: string,
  options: CompileArchLangOptions = {}
): Promise<CompileCanonicalFloorResult> {
  const result = compileCanonicalFloorWithArchLang(building, floorId, options);

  if (options.format === 'pdf') {
    // Re-compile scene if needed to feed toPdf
    const compileOptions: any = {};
    if (options.circulationOverlay) {
      compileOptions.overlays = ['circulation'];
    }
    const comp = compile(result.source, compileOptions);
    if (comp.scene) {
      try {
        const pdfBytes = await toPdf(comp.scene);
        result.pdf = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
        // Clear the sync warning if present
        result.warnings = result.warnings.filter((w) => !w.includes('compileCanonicalFloorWithArchLangAsync'));
      } catch (err: any) {
        result.warnings.push(`ArchLang toPdf error: ${err.message ?? String(err)}`);
      }
    }
  }

  return result;
}

/**
 * Analyzes the impact of room locks on a given floor, calculating adjacency boundaries,
 * flexible vs fixed area, and evaluating native ArchLang lock impact when modified source is provided.
 */
export function analyzeRoomLockImpact(
  building: Building,
  floorId: string,
  lockedRoomIds: string[] = [],
  targetRoomId?: string,
  modifiedBuilding?: Building
): RoomLockImpactAnalysis {
  const floor = building.floors.find((f) => f.id === floorId);
  if (!floor) {
    throw new Error(`Floor "${floorId}" not found in building "${building.name}" (${building.id}).`);
  }

  const { roomMap, stats } = computeRoomMapAndStats(building, floorId, lockedRoomIds);
  const lockedArchIds = new Set(lockedRoomIds.map(toArchLangId));
  const lockedRooms = Object.values(roomMap).filter(
    (r) => lockedRoomIds.includes(r.id) || lockedArchIds.has(r.archId)
  );

  // Derive adjacent rooms, boundary walls, and connected doors
  const lockedRawRooms = floor.rooms.filter((r) => lockedRooms.some((lr) => lr.id === r.id));
  const adjacentRoomIdSet = new Set<string>();
  const boundaryWallIdSet = new Set<string>();
  const connectedDoorIdSet = new Set<string>();

  for (const lr of lockedRawRooms) {
    const lrMinX = lr.x - 300;
    const lrMaxX = lr.x + lr.width + 300;
    const lrMinY = lr.y - 300;
    const lrMaxY = lr.y + lr.height + 300;

    // Adjacent rooms by geometric bounding proximity
    for (const other of floor.rooms) {
      if (other.id === lr.id) continue;
      if (
        other.x < lrMaxX &&
        other.x + other.width > lrMinX &&
        other.y < lrMaxY &&
        other.y + other.height > lrMinY
      ) {
        if (!lockedRooms.some((r) => r.id === other.id)) {
          adjacentRoomIdSet.add(other.id);
        }
      }
    }

    // Boundary walls touching this locked room
    for (const wall of floor.walls) {
      const wx1 = Math.min(wall.startPoint.x, wall.endPoint.x);
      const wx2 = Math.max(wall.startPoint.x, wall.endPoint.x);
      const wy1 = Math.min(wall.startPoint.y, wall.endPoint.y);
      const wy2 = Math.max(wall.startPoint.y, wall.endPoint.y);

      if (wx2 >= lr.x - 50 && wx1 <= lr.x + lr.width + 50 && wy2 >= lr.y - 50 && wy1 <= lr.y + lr.height + 50) {
        boundaryWallIdSet.add(wall.id);
      }
    }
  }

  // Connected doors on boundary walls
  for (const door of floor.doors) {
    if (boundaryWallIdSet.has(door.wallId)) {
      connectedDoorIdSet.add(door.id);
    }
  }

  const adjacentRooms = Array.from(adjacentRoomIdSet)
    .map((id) => roomMap[id])
    .filter(Boolean) as ArchLangRoomInfo[];

  let targetAssessment: RoomLockImpactAnalysis['targetAssessment'];
  if (targetRoomId) {
    const isTargetLocked = lockedRooms.some((r) => r.id === targetRoomId || r.archId === targetRoomId);
    const isTargetAdjacent = adjacentRoomIdSet.has(targetRoomId);

    if (isTargetLocked) {
      targetAssessment = {
        targetRoomId,
        status: 'LOCKED',
        reason: 'Room is locked. Direct modifications are disallowed to preserve user intent.',
      };
    } else if (isTargetAdjacent) {
      targetAssessment = {
        targetRoomId,
        status: 'CONSTRAINED',
        reason:
          'Room shares walls or boundary edges with one or more locked rooms. Modifications must preserve shared boundaries.',
      };
    } else {
      targetAssessment = {
        targetRoomId,
        status: 'FREE',
        reason: 'Room does not share boundaries with locked rooms and can be modified freely.',
      };
    }
  }

  // Run native ArchLang impact() if modifiedBuilding is supplied
  let nativeImpact: ImpactReport | undefined;
  let method: RoomLockImpactAnalysis['method'] = 'TOPOLOGICAL_ADJACENCY_GRAPH';

  if (modifiedBuilding) {
    try {
      const beforeDsl = canonicalToArchLang(building, floorId);
      const afterDsl = canonicalToArchLang(modifiedBuilding, floorId);
      const lockIds = lockedRooms.map((r) => r.archId);
      nativeImpact = impact(beforeDsl, afterDsl, { lock: lockIds });
      method = 'ARCHLANG_NATIVE_IMPACT';
    } catch {
      // Fallback stays topological
    }
  }

  return {
    floorId,
    method,
    lockedRoomIds: lockedRooms.map((r) => r.id),
    lockedRooms,
    adjacentRoomIds: Array.from(adjacentRoomIdSet),
    adjacentRooms,
    boundaryWallIds: Array.from(boundaryWallIdSet),
    connectedDoorIds: Array.from(connectedDoorIdSet),
    totalRooms: stats.roomCount,
    lockedCount: stats.lockedRoomCount,
    totalFloorAreaMm2: stats.totalAreaMm2,
    lockedAreaMm2: stats.lockedAreaMm2,
    flexibleAreaMm2: stats.totalAreaMm2 - stats.lockedAreaMm2,
    lockedAreaRatio: stats.totalAreaMm2 > 0 ? stats.lockedAreaMm2 / stats.totalAreaMm2 : 0,
    targetAssessment,
    nativeImpact,
  };
}
