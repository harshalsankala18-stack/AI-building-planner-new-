import type { Building } from '@ai-floor-planner/core';
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

export interface PascalScene {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
}

export interface CanonicalToPascalResult {
  scene: PascalScene;
  warnings: string[];
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
export function canonicalToPascal(building: Building): CanonicalToPascalResult {
  const warnings: string[] = [];
  const nodes: Record<string, AnyNode> = {};

  // 1. Site Node
  const siteId = toPascalId('site', building.site?.id ?? 'default-site');
  const sitePoints: [number, number][] = building.site?.plotBoundary?.points
    ? building.site.plotBoundary.points.map(p => [p.x / 1000, p.y / 1000] as [number, number])
    : [
        [0, 0],
        [(building.site?.plotWidth ?? 30000) / 1000, 0],
        [(building.site?.plotWidth ?? 30000) / 1000, (building.site?.plotDepth ?? 25000) / 1000],
        [0, (building.site?.plotDepth ?? 25000) / 1000],
      ];

  if (building.site?.siteZones && building.site.siteZones.length > 0) {
    warnings.push(
      `Site zones (${building.site.siteZones.map(z => `${z.name} [${z.kind}]`).join(', ')}) cannot be mapped natively to Pascal SiteNode schema in Phase 1.`
    );
  }
  if (building.site?.accessPoints && building.site.accessPoints.length > 0) {
    warnings.push(
      `Site access points (${building.site.accessPoints.map(a => a.id).join(', ')}) recorded as warnings; not directly represented in Pascal SiteNode.`
    );
  }

  const buildingId = toPascalId('building', building.id);

  // 2. Process Floors (Levels)
  const levelIds: string[] = [];
  let runningElevation = 0;

  const groundLevelFloor = building.floors.find(f => f.level === 0) ?? building.floors[0];
  const groundLevelId = groundLevelFloor ? toPascalId('level', groundLevelFloor.id) : undefined;

  for (const floor of building.floors) {
    const levelId = toPascalId('level', floor.id);
    levelIds.push(levelId);

    const floorHeightM = (floor.floorHeight ?? 3000) / 1000;
    const baseElevationM = runningElevation;
    runningElevation += floorHeightM;

    const levelChildren: string[] = [];

    // 2a. Slab Node
    if (floor.boundary?.points && floor.boundary.points.length >= 3) {
      const slabId = toPascalId('slab', floor.id);
      const slabPoints: [number, number][] = floor.boundary.points.map(
        p => [p.x / 1000, p.y / 1000] as [number, number]
      );
      const slabNode = SlabNode.parse({
        id: slabId,
        name: `${floor.name} Slab`,
        parentId: levelId,
        polygon: slabPoints,
        thickness: 0.2,
      });
      nodes[slabId] = slabNode;
      levelChildren.push(slabId);
    }

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
        zonePoints = room.boundary.points.map(p => [p.x / 1000, p.y / 1000] as [number, number]);
      } else {
        const x1 = room.x / 1000;
        const y1 = room.y / 1000;
        const x2 = (room.x + room.width) / 1000;
        const y2 = (room.y + room.height) / 1000;
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
    const floorWallMap = new Map<string, string>(); // canonical wall id -> pascal wall id
    const wallChildrenMap = new Map<string, string[]>(); // pascal wall id -> opening ids

    for (const wall of floor.walls) {
      const wallId = toPascalId('wall', wall.id);
      floorWallMap.set(wall.id, wallId);
      wallChildrenMap.set(wallId, []);
    }

    // Doors
    for (const door of floor.doors) {
      const pascalWallId = floorWallMap.get(door.wallId);
      const hostWall = floor.walls.find(w => w.id === door.wallId);

      if (pascalWallId && hostWall) {
        const doorId = toPascalId('door', door.id);
        const dx = (hostWall.endPoint.x - hostWall.startPoint.x) / 1000;
        const dy = (hostWall.endPoint.y - hostWall.startPoint.y) / 1000;
        const vx = (door.position.x - hostWall.startPoint.x) / 1000;
        const vy = (door.position.y - hostWall.startPoint.y) / 1000;
        const wallLen = Math.hypot(dx, dy);
        const s = wallLen > 0 ? Math.max(0, Math.min(wallLen, (vx * dx + vy * dy) / wallLen)) : 0;

        const doorNode = DoorNode.parse({
          id: doorId,
          name: `Door ${door.id}`,
          parentId: pascalWallId,
          wallId: pascalWallId,
          position: [s, 0, 0],
          width: door.width / 1000,
          height: door.height / 1000,
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
      const pascalWallId = floorWallMap.get(win.wallId);
      const hostWall = floor.walls.find(w => w.id === win.wallId);

      if (pascalWallId && hostWall) {
        const winId = toPascalId('window', win.id);
        const dx = (hostWall.endPoint.x - hostWall.startPoint.x) / 1000;
        const dy = (hostWall.endPoint.y - hostWall.startPoint.y) / 1000;
        const vx = (win.position.x - hostWall.startPoint.x) / 1000;
        const vy = (win.position.y - hostWall.startPoint.y) / 1000;
        const wallLen = Math.hypot(dx, dy);
        const s = wallLen > 0 ? Math.max(0, Math.min(wallLen, (vx * dx + vy * dy) / wallLen)) : 0;
        const sillM = (win.sillHeight ?? 900) / 1000;

        const winNode = WindowNode.parse({
          id: winId,
          name: `Window ${win.id}`,
          parentId: pascalWallId,
          wallId: pascalWallId,
          position: [s, sillM, 0],
          width: win.width / 1000,
          height: win.height / 1000,
          sillHeight: sillM,
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
    for (const wall of floor.walls) {
      const wallId = toPascalId('wall', wall.id);
      const children = wallChildrenMap.get(wallId) ?? [];

      const wallNode = WallNode.parse({
        id: wallId,
        name: `Wall ${wall.id}`,
        parentId: levelId,
        start: [wall.startPoint.x / 1000, wall.startPoint.y / 1000],
        end: [wall.endPoint.x / 1000, wall.endPoint.y / 1000],
        thickness: wall.thickness / 1000,
        height: floorHeightM,
        children,
        metadata: {
          canonicalId: wall.id,
          wallType: wall.type,
          wallUse: wall.wallUse,
          loadBearing: wall.loadBearing,
        },
      });

      nodes[wallId] = wallNode;
      levelChildren.push(wallId);
    }

    // 2e. Columns
    if (floor.columns) {
      for (const col of floor.columns) {
        const colId = toPascalId('column', col.id);
        const colWidthM = (col.width ?? 300) / 1000;
        const colDepthM = (col.depth ?? 300) / 1000;

        const colNode = ColumnNode.parse({
          id: colId,
          name: `Column ${col.id}`,
          parentId: levelId,
          position: [col.position.x / 1000, 0, col.position.y / 1000],
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

    // 2f. Stairs (warn unmapped)
    if (floor.stairs && floor.stairs.length > 0) {
      warnings.push(
        `Floor ${floor.name} contains ${floor.stairs.length} stair(s) (${floor.stairs.map(s => s.id).join(', ')}). Full parametric 3D stairs require specialized procedural stair runs not mapped in Phase 1.`
      );
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
