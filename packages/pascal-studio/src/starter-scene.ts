import {
  type AnyNode,
  SiteNode,
  BuildingNode,
  LevelNode,
  SlabNode,
  WallNode,
  DoorNode,
  WindowNode,
  ZoneNode,
} from '@pascal-app/core';

export interface StandalonePascalScene {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
}

/**
 * Creates a valid, realistic starter architectural house scene.
 * Used for standalone editor mode (:5174) and iframe fallback.
 */
export function createStarterScene(): StandalonePascalScene {
  const nodes: Record<string, AnyNode> = {};

  const site = SiteNode.parse({
    id: 'site_default',
    name: 'Project Site',
    children: ['building_main'],
  });
  nodes[site.id] = site;

  const building = BuildingNode.parse({
    id: 'building_main',
    name: 'Main Building',
    parentId: 'site_default',
    groundLevelId: 'level_ground',
    children: ['level_ground'],
  });
  nodes[building.id] = building;

  const level = LevelNode.parse({
    id: 'level_ground',
    name: 'Ground Floor',
    parentId: 'building_main',
    elevation: 0,
    height: 3,
    children: ['slab_ground', 'wall_south', 'wall_east', 'wall_north', 'wall_west', 'zone_living'],
  });
  nodes[level.id] = level;

  const slab = SlabNode.parse({
    id: 'slab_ground',
    name: 'Ground Slab',
    parentId: 'level_ground',
    polygon: [
      [0, 0],
      [8, 0],
      [8, 8],
      [0, 8],
    ],
    thickness: 0.2,
  });
  nodes[slab.id] = slab;

  const wallSouth = WallNode.parse({
    id: 'wall_south',
    name: 'South Wall',
    parentId: 'level_ground',
    start: [0, 0],
    end: [8, 0],
    thickness: 0.2,
    height: 3,
    children: ['door_entry'],
  });
  nodes[wallSouth.id] = wallSouth;

  const door = DoorNode.parse({
    id: 'door_entry',
    name: 'Main Entrance',
    parentId: 'wall_south',
    wallId: 'wall_south',
    position: [4, 0, 0],
    width: 1.0,
    height: 2.1,
  });
  nodes[door.id] = door;

  const wallEast = WallNode.parse({
    id: 'wall_east',
    name: 'East Wall',
    parentId: 'level_ground',
    start: [8, 0],
    end: [8, 8],
    thickness: 0.2,
    height: 3,
    children: ['window_east'],
  });
  nodes[wallEast.id] = wallEast;

  const win = WindowNode.parse({
    id: 'window_east',
    name: 'East Window',
    parentId: 'wall_east',
    wallId: 'wall_east',
    position: [4, 1.0, 0],
    width: 1.5,
    height: 1.2,
    sillHeight: 1.0,
  });
  nodes[win.id] = win;

  const wallNorth = WallNode.parse({
    id: 'wall_north',
    name: 'North Wall',
    parentId: 'level_ground',
    start: [8, 8],
    end: [0, 8],
    thickness: 0.2,
    height: 3,
    children: [],
  });
  nodes[wallNorth.id] = wallNorth;

  const wallWest = WallNode.parse({
    id: 'wall_west',
    name: 'West Wall',
    parentId: 'level_ground',
    start: [0, 8],
    end: [0, 0],
    thickness: 0.2,
    height: 3,
    children: [],
  });
  nodes[wallWest.id] = wallWest;

  const zone = ZoneNode.parse({
    id: 'zone_living',
    name: 'Living Room',
    parentId: 'level_ground',
    polygon: [
      [0.2, 0.2],
      [7.8, 0.2],
      [7.8, 7.8],
      [0.2, 7.8],
    ],
    spaceRole: 'room',
  });
  nodes[zone.id] = zone;

  return {
    nodes,
    rootNodeIds: ['site_default'],
  };
}
