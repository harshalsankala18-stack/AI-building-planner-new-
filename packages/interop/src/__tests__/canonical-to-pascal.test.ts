import { describe, it, expect, beforeAll } from 'vitest';
import { loadPlugin } from '@pascal-app/core';
import { builtinPlugin } from '@pascal-app/nodes';
import {
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
import { canonicalToPascal } from '../pascal/canonical-to-pascal';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building';

describe('canonicalToPascal Translator', () => {
  beforeAll(async () => {
    await loadPlugin(builtinPlugin);
    expect(builtinPlugin.id).toBe('pascal:core');
  });

  it('translates real canonical fixture into a valid Pascal scene graph', () => {
    const building = createMockCanonicalBuilding();
    const { scene, warnings } = canonicalToPascal(building);

    expect(scene).toBeDefined();
    expect(scene.rootNodeIds.length).toBe(1);
    const rootId = scene.rootNodeIds[0]!;
    const siteNode = scene.nodes[rootId] as any;
    expect(siteNode).toBeDefined();
    expect(siteNode.type).toBe('site');

    // Verify SiteNode schema
    const siteParse = SiteNode.safeParse(siteNode);
    expect(siteParse.success).toBe(true);

    // Verify BuildingNode
    const buildingId = siteNode.children[0];
    const buildingNode = scene.nodes[buildingId] as any;
    expect(buildingNode).toBeDefined();
    expect(buildingNode.type).toBe('building');
    expect(buildingNode.parentId).toBe(rootId);
    const bldgParse = BuildingNode.safeParse(buildingNode);
    expect(bldgParse.success).toBe(true);

    // Verify preservation of counts
    expect(building.floors.length).toBe(1);
    expect(buildingNode.children.length).toBe(1); // 1 level

    const levelId = buildingNode.children[0];
    const levelNode = scene.nodes[levelId] as any;
    expect(levelNode).toBeDefined();
    expect(levelNode.type).toBe('level');
    expect(levelNode.parentId).toBe(buildingId);
    const levelParse = LevelNode.safeParse(levelNode);
    expect(levelParse.success).toBe(true);

    // Verify Level children count (1 slab + 3 zones + 3 walls = 7 children)
    const expectedFloor = building.floors[0]!;
    const floorWallNodes = Object.values(scene.nodes).filter(n => n.type === 'wall' && n.parentId === levelId);
    const floorZoneNodes = Object.values(scene.nodes).filter(n => n.type === 'zone' && n.parentId === levelId);
    const floorSlabNodes = Object.values(scene.nodes).filter(n => n.type === 'slab' && n.parentId === levelId);
    const floorDoorNodes = Object.values(scene.nodes).filter(n => n.type === 'door');
    const floorWindowNodes = Object.values(scene.nodes).filter(n => n.type === 'window');

    expect(floorWallNodes.length).toBe(expectedFloor.walls.length);
    expect(floorZoneNodes.length).toBe(expectedFloor.rooms.length);
    expect(floorSlabNodes.length).toBe(1);
    expect(floorDoorNodes.length).toBe(expectedFloor.doors.length);
    expect(floorWindowNodes.length).toBe(expectedFloor.windows.length);

    // Verify parent-child integrity across ALL nodes
    for (const [id, node] of Object.entries(scene.nodes)) {
      expect(node.id).toBe(id);

      // Verify each node against its specific schema
      switch (node.type) {
        case 'site':
          expect(SiteNode.safeParse(node).success).toBe(true);
          break;
        case 'building':
          expect(BuildingNode.safeParse(node).success).toBe(true);
          break;
        case 'level':
          expect(LevelNode.safeParse(node).success).toBe(true);
          break;
        case 'slab':
          expect(SlabNode.safeParse(node).success).toBe(true);
          break;
        case 'wall':
          expect(WallNode.safeParse(node).success).toBe(true);
          break;
        case 'zone':
          expect(ZoneNode.safeParse(node).success).toBe(true);
          break;
        case 'door':
          expect(DoorNode.safeParse(node).success).toBe(true);
          break;
        case 'window':
          expect(WindowNode.safeParse(node).success).toBe(true);
          break;
        case 'column':
          expect(ColumnNode.safeParse(node).success).toBe(true);
          break;
      }

      // Verify children reference valid existing nodes and have matching parentId
      const nodeWithChildren = node as { children?: string[] };
      if (nodeWithChildren.children) {
        for (const childId of nodeWithChildren.children) {
          const child = scene.nodes[childId];
          expect(child).toBeDefined();
          expect(child?.parentId).toBe(node.id);
        }
      }
    }

    // Verify coordinate conversion: mm to meters
    // Site boundary was 30000 x 25000 mm -> 30 x 25 m
    const sitePoly = siteNode.polygon.points;
    expect(sitePoly).toContainEqual([30, 25]);

    // Wall height: 3100 mm -> 3.1 m
    const sampleWall = floorWallNodes[0] as any;
    expect(sampleWall.height).toBeCloseTo(3.1);

    // Door width: 900 mm -> 0.9 m, height: 2100 mm -> 2.1 m
    const sampleDoor = floorDoorNodes[0] as any;
    expect(sampleDoor.width).toBeCloseTo(0.9);
    expect(sampleDoor.height).toBeCloseTo(2.1);

    // Window width: 1500 mm -> 1.5 m, height: 1200 mm -> 1.2 m, sill: 900 mm -> 0.9 m
    const sampleWindow = floorWindowNodes[0] as any;
    expect(sampleWindow.width).toBeCloseTo(1.5);
    expect(sampleWindow.height).toBeCloseTo(1.2);
    expect(sampleWindow.position[1]).toBeCloseTo(0.9);

    // Verify explicit warnings for unmapped items
    expect(warnings.some(w => w.includes('Site zones'))).toBe(true);
    expect(warnings.some(w => w.includes('stair'))).toBe(true);
  });
});
