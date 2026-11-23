import type { Building, Room, Wall, Door, Window, Stair } from '@ai-floor-planner/core';
import { WallType, DoorType, WindowType, RoomType, SwingDirection, StairType, Direction } from '@ai-floor-planner/core';
import type { PascalScene } from './canonical-to-pascal';

/**
 * Extracts raw ID from a Pascal prefixed identifier.
 * (e.g., 'wall_ext_1' -> 'ext_1', 'level_floor-0' -> 'floor-0')
 */
function fromPascalId(pascalId: string, prefix: string): string {
  if (pascalId.startsWith(`${prefix}_`)) {
    return pascalId.slice(prefix.length + 1);
  }
  return pascalId;
}

/**
 * Patches a Canonical Building Model with modifications from an edited Pascal 3D Scene Graph.
 *
 * Pascal units: meters
 * Canonical Building units: millimeters
 *
 * Preserves structural columns, shafts, stairs, compliance annotations, and unedited floors.
 */
export function pascalToCanonicalPatch(
  pascalScene: PascalScene,
  baseBuilding: Building,
): Building {
  const cloned: any = JSON.parse(JSON.stringify(baseBuilding));
  cloned.version = (cloned.version ?? 1) + 1;
  cloned.updatedAt = new Date().toISOString();
  if (!cloned.metadata) cloned.metadata = {};
  cloned.metadata.lastEditedBy = '3d';
  cloned.metadata.last3dSyncAt = new Date().toISOString();

  const nodes = pascalScene.nodes || {};

  // Find all level nodes
  const levelNodes = Object.values(nodes).filter(
    (n: any) => n.type === 'level' || n.id?.startsWith('level_'),
  );

  for (const levelNode of levelNodes as any[]) {
    const rawFloorId = fromPascalId(levelNode.id, 'level');
    // Match floor by exact ID or level index
    let floor = cloned.floors.find((f: any) => f.id === rawFloorId);
    if (!floor) {
      floor = cloned.floors.find((f: any) => String(f.level) === rawFloorId);
    }
    if (!floor && cloned.floors.length === 1) {
      floor = cloned.floors[0];
    }
    if (!floor) continue;

    // Update floor height if modified in Pascal
    if (typeof levelNode.height === 'number' && levelNode.height > 0) {
      floor.floorHeight = Math.round(levelNode.height * 1000);
    }

    // 1. Extract Walls belonging to this level
    const wallNodes = Object.values(nodes).filter(
      (n: any) => (n.type === 'wall' || n.id?.startsWith('wall_')) && n.parentId === levelNode.id,
    ) as any[];

    if (wallNodes.length > 0) {
      const updatedWalls: Wall[] = [];

      for (const wn of wallNodes) {
        const rawWallId = fromPascalId(wn.id, 'wall');
        const existingWall = floor.walls?.find((w: any) => w.id === rawWallId);

        const startX = Math.round((wn.start?.[0] ?? 0) * 1000);
        const startY = Math.round((wn.start?.[1] ?? 0) * 1000);
        const endX = Math.round((wn.end?.[0] ?? 0) * 1000);
        const endY = Math.round((wn.end?.[1] ?? 0) * 1000);
        const thickness = Math.round((wn.thickness ?? 0.23) * 1000);
        const heightMm = Math.round((wn.height ?? 3.0) * 1000);

        const wallType =
          existingWall?.type ??
          (thickness >= 200 ? WallType.External : WallType.Internal);

        updatedWalls.push({
          id: existingWall?.id || rawWallId,
          floorId: floor.id,
          startPoint: { x: startX, y: startY },
          endPoint: { x: endX, y: endY },
          thickness: Math.max(100, thickness),
          heightMm: Math.max(2000, heightMm),
          type: wallType,
          wallUse: existingWall?.wallUse || (thickness >= 200 ? 'EXTERNAL' : 'INTERNAL_PARTITION'),
          roomIds: existingWall?.roomIds || [],
          unitIds: existingWall?.unitIds || [],
          hasOpening: (wn.children?.length ?? 0) > 0,
          loadBearing: existingWall?.loadBearing ?? (thickness >= 200),
        });
      }

      floor.walls = updatedWalls;
    }

    // 2. Extract Doors & Windows hosted on walls
    const updatedDoors: Door[] = [];
    const updatedWindows: Window[] = [];

    const doorNodes = Object.values(nodes).filter(
      (n: any) => n.type === 'door' || n.id?.startsWith('door_'),
    ) as any[];

    for (const dn of doorNodes) {
      const rawDoorId = fromPascalId(dn.id, 'door');
      const parentWallNode = nodes[dn.parentId] as any;
      const wallId = parentWallNode ? fromPascalId(parentWallNode.id, 'wall') : dn.parentId;

      let posX = 0;
      let posY = 0;
      if (parentWallNode && parentWallNode.start && parentWallNode.end) {
        const offsetRatio = dn.position ?? 0.5;
        posX = Math.round(
          (parentWallNode.start[0] + (parentWallNode.end[0] - parentWallNode.start[0]) * offsetRatio) *
            1000,
        );
        posY = Math.round(
          (parentWallNode.start[1] + (parentWallNode.end[1] - parentWallNode.start[1]) * offsetRatio) *
            1000,
        );
      }

      const existingDoor = floor.doors?.find((d: any) => d.id === rawDoorId);
      const connects: readonly [string, string] = existingDoor?.connectsRooms && existingDoor.connectsRooms.length >= 2
        ? existingDoor.connectsRooms
        : ['__outside__', existingDoor?.connectsRooms?.[0] || '__outside__'];

      updatedDoors.push({
        id: existingDoor?.id || rawDoorId,
        floorId: floor.id,
        wallId: wallId || existingDoor?.wallId || '',
        position: posX !== 0 && posY !== 0 ? { x: posX, y: posY } : existingDoor?.position || { x: 0, y: 0 },
        width: Math.round((dn.width ?? 0.9) * 1000),
        height: Math.round((dn.height ?? 2.1) * 1000),
        type: existingDoor?.type || (dn.doorType === 'sliding' ? DoorType.Sliding : dn.doorType === 'double' ? DoorType.Double : DoorType.Single),
        swingDirection: existingDoor?.swingDirection || (dn.swingDirection === 'outward' ? SwingDirection.Outward : SwingDirection.Inward),
        connectsRooms: connects,
        category: existingDoor?.category || dn.metadata?.category || dn.metadata?.doorCategory,
        placement: existingDoor?.placement ?? 'interior',
        leafCount: dn.leafCount ?? existingDoor?.leafCount ?? 1,
        style: existingDoor?.style,
      });
    }

    const windowNodes = Object.values(nodes).filter(
      (n: any) => n.type === 'window' || n.id?.startsWith('window_'),
    ) as any[];

    for (const wn of windowNodes) {
      const rawWindowId = fromPascalId(wn.id, 'window');
      const parentWallNode = nodes[wn.parentId] as any;
      const wallId = parentWallNode ? fromPascalId(parentWallNode.id, 'wall') : wn.parentId;

      let posX = 0;
      let posY = 0;
      if (parentWallNode && parentWallNode.start && parentWallNode.end) {
        const offsetRatio = wn.position ?? 0.5;
        posX = Math.round(
          (parentWallNode.start[0] + (parentWallNode.end[0] - parentWallNode.start[0]) * offsetRatio) *
            1000,
        );
        posY = Math.round(
          (parentWallNode.start[1] + (parentWallNode.end[1] - parentWallNode.start[1]) * offsetRatio) *
            1000,
        );
      }

      const existingWindow = floor.windows?.find((w: any) => w.id === rawWindowId);
      updatedWindows.push({
        id: existingWindow?.id || rawWindowId,
        floorId: floor.id,
        wallId: wallId || existingWindow?.wallId || '',
        position: posX !== 0 && posY !== 0 ? { x: posX, y: posY } : existingWindow?.position || { x: 0, y: 0 },
        width: Math.round((wn.width ?? 1.2) * 1000),
        height: Math.round((wn.height ?? 1.2) * 1000),
        sillHeight: Math.round((wn.sillHeight ?? 0.9) * 1000),
        sillHeightMm: Math.round((wn.sillHeight ?? 0.9) * 1000),
        type: existingWindow?.type || (wn.windowType === 'sliding' ? WindowType.Sliding : wn.windowType === 'louvered' ? WindowType.Ventilator : WindowType.Casement),
        roomId: existingWindow?.roomId || '',
        category: existingWindow?.category || wn.metadata?.category || wn.metadata?.windowCategory,
        placement: existingWindow?.placement ?? 'exterior',
        leafCount: existingWindow?.leafCount ?? 2,
        style: existingWindow?.style,
      });
    }

    if (updatedDoors.length > 0) floor.doors = updatedDoors;
    if (updatedWindows.length > 0) floor.windows = updatedWindows;

    // Extract Stairs belonging to this level
    const stairNodes = Object.values(nodes).filter(
      (n: any) => (n.type === 'stair' || n.id?.startsWith('stair_')) && n.parentId === levelNode.id,
    ) as any[];

    if (stairNodes.length > 0) {
      const updatedStairs: Stair[] = [];
      for (const sn of stairNodes) {
        const rawStairId = fromPascalId(sn.id, 'stair');
        const existingStair = floor.stairs?.find((s: any) => s.id === rawStairId);
        const sx = Math.round((sn.position?.[0] ?? 0) * 1000);
        const sy = Math.round((sn.position?.[1] ?? 0) * 1000);
        const sw = Math.round((sn.width ?? 2.4) * 1000);
        const riserCount = sn.stepCount ?? existingStair?.riserCount ?? 18;
        const floorHeight = floor.floorHeight ?? 3000;

        updatedStairs.push({
          id: existingStair?.id || rawStairId,
          floorId: floor.id,
          type: existingStair?.type || StairType.UShaped,
          boundary: existingStair?.boundary || {
            points: [
              { x: sx, y: sy },
              { x: sx + sw, y: sy },
              { x: sx + sw, y: sy + 4800 },
              { x: sx, y: sy + 4800 },
            ],
          },
          x: sx,
          y: sy,
          width: sw,
          length: existingStair?.length ?? 4800,
          direction: existingStair?.direction ?? Direction.North,
          riserCount,
          riserHeight: Math.round(floorHeight / riserCount),
          treadDepth: existingStair?.treadDepth ?? 250,
          landingWidth: existingStair?.landingWidth ?? 1200,
          connectsFloors: existingStair?.connectsFloors ?? [floor.level, floor.level + 1],
          verticalCoreId: existingStair?.verticalCoreId ?? `core_stair_${rawStairId}`,
          totalRiseMm: floorHeight,
          handrail: true,
        });
      }
      floor.stairs = updatedStairs;
    }

    // 3. Extract Zones (Rooms)
    const zoneNodes = Object.values(nodes).filter(
      (n: any) => (n.type === 'zone' || n.id?.startsWith('zone_')) && n.parentId === levelNode.id,
    ) as any[];

    if (zoneNodes.length > 0) {
      const updatedRooms: Room[] = [];

      for (const zn of zoneNodes) {
        const rawRoomId = fromPascalId(zn.id, 'zone');
        const existingRoom = floor.rooms?.find((r: any) => r.id === rawRoomId);

        let points = existingRoom?.boundary?.points || [];
        if (Array.isArray(zn.polygon) && zn.polygon.length >= 3) {
          points = zn.polygon.map((p: [number, number]) => ({
            x: Math.round(p[0] * 1000),
            y: Math.round(p[1] * 1000),
          }));
        }

        const xs = points.map((p: any) => p.x);
        const ys = points.map((p: any) => p.y);
        const minX = xs.length ? Math.min(...xs) : (existingRoom?.x ?? 0);
        const maxX = xs.length ? Math.max(...xs) : (existingRoom?.x ?? 0) + (existingRoom?.width ?? 3000);
        const minY = ys.length ? Math.min(...ys) : (existingRoom?.y ?? 0);
        const maxY = ys.length ? Math.max(...ys) : (existingRoom?.y ?? 0) + (existingRoom?.height ?? 3000);

        const width = Math.max(1000, maxX - minX);
        const height = Math.max(1000, maxY - minY);
        const area = Math.round((zn.area ? zn.area * 1_000_000 : width * height));

        updatedRooms.push({
          id: existingRoom?.id || rawRoomId,
          floorId: floor.id,
          unitId: existingRoom?.unitId,
          name: zn.name || zn.label || existingRoom?.name || 'Room',
          type: existingRoom?.type || RoomType.Living,
          x: minX,
          y: minY,
          width,
          height,
          area,
          rotation: existingRoom?.rotation ?? 0,
          priority: existingRoom?.priority ?? 1,
          tags: existingRoom?.tags || [],
          adjacencyRequirements: existingRoom?.adjacencyRequirements || [],
          daylightRequirement: existingRoom?.daylightRequirement || (1 as any),
          privacyRequirement: existingRoom?.privacyRequirement || (1 as any),
          ventilationRequired: existingRoom?.ventilationRequired ?? true,
          isFixed: existingRoom?.isFixed ?? false,
          boundary: { points },
        });
      }

      floor.rooms = updatedRooms;
    }
  }

  return cloned as Building;
}
