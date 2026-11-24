import type { Building, Room, Wall, Door, Window, Stair, CanonicalFurnitureItem } from '@ai-floor-planner/core';
import { WallType, DoorType, WindowType, RoomType, SwingDirection, StairType, Direction } from '@ai-floor-planner/core';
import type { PascalScene } from './canonical-to-pascal';

function safeNum(val: unknown, fallback = 0): number {
  const n = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(n) ? n : fallback;
}

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

    // 1. Extract Walls belonging to this level (differential update)
    const wallNodes = Object.values(nodes).filter(
      (n: any) => (n.type === 'wall' || n.id?.startsWith('wall_')) && n.parentId === levelNode.id,
    ) as any[];

    if (wallNodes.length > 0) {
      const updatedWallsMap = new Map<string, Wall>();
      // Preserve existing walls first
      for (const w of floor.walls ?? []) {
        updatedWallsMap.set(w.id, w);
      }

      for (const wn of wallNodes) {
        const rawWallId = fromPascalId(wn.id, 'wall');
        const existingWall = updatedWallsMap.get(rawWallId);

        const startX = Math.round((wn.start?.[0] ?? 0) * 1000);
        const startY = Math.round((wn.start?.[1] ?? 0) * 1000);
        const endX = Math.round((wn.end?.[0] ?? 0) * 1000);
        const endY = Math.round((wn.end?.[1] ?? 0) * 1000);
        const thickness = Math.round((wn.thickness ?? 0.23) * 1000);
        const heightMm = Math.round((wn.height ?? 3.0) * 1000);

        const wallType =
          existingWall?.type ??
          (thickness >= 200 ? WallType.External : WallType.Internal);

        const wallId = existingWall?.id || rawWallId;
        updatedWallsMap.set(wallId, {
          id: wallId,
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

      floor.walls = Array.from(updatedWallsMap.values());
    }

    // 2. Extract Doors & Windows hosted on walls (differential update)
    const doorNodes = Object.values(nodes).filter(
      (n: any) => n.type === 'door' || n.id?.startsWith('door_'),
    ) as any[];

    if (doorNodes.length > 0) {
      const updatedDoorsMap = new Map<string, Door>();
      for (const d of floor.doors ?? []) {
        updatedDoorsMap.set(d.id, d);
      }

      for (const dn of doorNodes) {
        const rawDoorId = fromPascalId(dn.id, 'door');
        const parentWallNode = nodes[dn.parentId] as any;
        const wallId = parentWallNode ? fromPascalId(parentWallNode.id, 'wall') : dn.parentId;

        let posX = 0;
        let posY = 0;
        if (parentWallNode && parentWallNode.start && parentWallNode.end) {
          let ratio = 0.5;
          if (Array.isArray(dn.position)) {
            const u = dn.position[0];
            const wallLen = Math.hypot(parentWallNode.end[0] - parentWallNode.start[0], parentWallNode.end[1] - parentWallNode.start[1]);
            ratio = wallLen > 0 ? Math.max(0, Math.min(1, u / wallLen)) : 0.5;
          } else if (typeof dn.position === 'number') {
            ratio = dn.position;
          }
          posX = Math.round(
            (parentWallNode.start[0] + (parentWallNode.end[0] - parentWallNode.start[0]) * ratio) *
              1000,
          );
          posY = Math.round(
            (parentWallNode.start[1] + (parentWallNode.end[1] - parentWallNode.start[1]) * ratio) *
              1000,
          );
        }

        const existingDoor = updatedDoorsMap.get(rawDoorId);
        const connects: readonly [string, string] = existingDoor?.connectsRooms && existingDoor.connectsRooms.length >= 2
          ? existingDoor.connectsRooms
          : ['__outside__', existingDoor?.connectsRooms?.[0] || '__outside__'];

        const doorId = existingDoor?.id || rawDoorId;
        updatedDoorsMap.set(doorId, {
          id: doorId,
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
      floor.doors = Array.from(updatedDoorsMap.values());
    }

    const windowNodes = Object.values(nodes).filter(
      (n: any) => n.type === 'window' || n.id?.startsWith('window_'),
    ) as any[];

    if (windowNodes.length > 0) {
      const updatedWindowsMap = new Map<string, Window>();
      for (const w of floor.windows ?? []) {
        updatedWindowsMap.set(w.id, w);
      }

      for (const wn of windowNodes) {
        const rawWindowId = fromPascalId(wn.id, 'window');
        const parentWallNode = nodes[wn.parentId] as any;
        const wallId = parentWallNode ? fromPascalId(parentWallNode.id, 'wall') : wn.parentId;

        let posX = 0;
        let posY = 0;
        if (parentWallNode && parentWallNode.start && parentWallNode.end) {
          let ratio = 0.5;
          if (Array.isArray(wn.position)) {
            const u = wn.position[0];
            const wallLen = Math.hypot(parentWallNode.end[0] - parentWallNode.start[0], parentWallNode.end[1] - parentWallNode.start[1]);
            ratio = wallLen > 0 ? Math.max(0, Math.min(1, u / wallLen)) : 0.5;
          } else if (typeof wn.position === 'number') {
            ratio = wn.position;
          }
          posX = Math.round(
            (parentWallNode.start[0] + (parentWallNode.end[0] - parentWallNode.start[0]) * ratio) *
              1000,
          );
          posY = Math.round(
            (parentWallNode.start[1] + (parentWallNode.end[1] - parentWallNode.start[1]) * ratio) *
              1000,
          );
        }

        const existingWindow = updatedWindowsMap.get(rawWindowId);
        const winId = existingWindow?.id || rawWindowId;
        updatedWindowsMap.set(winId, {
          id: winId,
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
      floor.windows = Array.from(updatedWindowsMap.values());
    }

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
      const updatedRoomsMap = new Map<string, Room>();
      // Preserve existing rooms first
      for (const r of floor.rooms ?? []) {
        updatedRoomsMap.set(r.id, r);
      }

      for (const zn of zoneNodes) {
        const rawRoomId = fromPascalId(zn.id, 'zone');
        const existingRoom = updatedRoomsMap.get(rawRoomId);

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

        const roomId = existingRoom?.id || rawRoomId;
        updatedRoomsMap.set(roomId, {
          id: roomId,
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

      floor.rooms = Array.from(updatedRoomsMap.values());
    }

    // 4. Extract Furniture & Interior Lighting Items (ItemNode) (§Stage B2)
    const ceilingNodes = Object.values(nodes).filter(
      (n: any) => (n.type === 'ceiling' || n.id?.startsWith('ceiling_')) && n.parentId === levelNode.id,
    ) as any[];
    const ceilingIds = new Set(ceilingNodes.map((c) => c.id));

    const itemNodes = Object.values(nodes).filter(
      (n: any) =>
        (n.type === 'item' || n.id?.startsWith('item_')) &&
        (n.parentId === levelNode.id || ceilingIds.has(n.parentId)),
    ) as any[];

    if (itemNodes.length > 0) {
      const updatedFurnitureMap = new Map<string, CanonicalFurnitureItem>();
      for (const f of floor.furniture ?? []) {
        updatedFurnitureMap.set(f.id, f);
      }

      for (const inItem of itemNodes) {
        const rawItemId = fromPascalId(inItem.id, 'item');
        const existingItem = updatedFurnitureMap.get(rawItemId) ||
          (floor.furniture?.find((f: any) => f.id === inItem.metadata?.canonicalItemId));

        const isCeiling =
          inItem.metadata?.mountType === 'ceiling' ||
          ceilingIds.has(inItem.parentId) ||
          inItem.asset?.attachTo === 'ceiling';

        const assetDim = inItem.asset?.dimensions ?? [1, 0.8, 0.8];
        const widthMm = Math.round(safeNum(assetDim[0], 1) * 1000);
        const heightMm = Math.round(safeNum(assetDim[1], 0.8) * 1000);
        const depthMm = Math.round(safeNum(assetDim[2], 0.8) * 1000);

        // Convert center-based Pascal position back to canonical min bounds
        const rawCenterX = safeNum(inItem.position?.[0], 0);
        const rawCenterY = safeNum(inItem.position?.[2], 0);
        const posX = Math.round((rawCenterX - (widthMm / 2000)) * 1000);
        const elevationY = Math.round(safeNum(inItem.position?.[1], isCeiling ? 2680 : 0) * 1000);
        const posY = Math.round((rawCenterY - (depthMm / 2000)) * 1000);

        const yawRad = inItem.rotation?.[1] ?? 0;
        const rotationDeg = Math.round((yawRad * 180) / Math.PI);

        const itemId = existingItem?.id || inItem.metadata?.canonicalItemId || rawItemId;
        updatedFurnitureMap.set(itemId, {
          id: itemId,
          type: existingItem?.type ?? 'table',
          roomId: inItem.metadata?.canonicalRoomId || existingItem?.roomId || '',
          floorId: floor.id,
          category: inItem.metadata?.category || inItem.asset?.category || 'furniture',
          kind: inItem.metadata?.kind || inItem.asset?.id || 'misc',
          label: inItem.name || inItem.asset?.name || existingItem?.label || 'Interior Element',
          mountType: isCeiling ? 'ceiling' : (inItem.asset?.attachTo === 'wall' ? 'wall' : 'floor'),
          positionMm: { x: posX, y: posY, z: elevationY },
          dimensionsMm: { width: widthMm, depth: depthMm, height: heightMm },
          xMm: posX,
          yMm: posY,
          widthMm,
          depthMm,
          heightMm,
          elevationMm: elevationY,
          rotationDeg,
          layer: 'A-FURN',
          locked: inItem.metadata?.locked ?? existingItem?.locked ?? false,
        });
      }

      floor.furniture = Array.from(updatedFurnitureMap.values());
    }
  }

  return cloned as Building;
}
