import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
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
  StairNode,
  StairSegmentNode,
} from '@pascal-app/core';
import {
  canonicalToPascal,
  KNOWN_FURNITURE_GLB_KINDS,
  resolveFurnitureAssetKind,
} from '../pascal/canonical-to-pascal.js';
import { canonicalToArchLang } from '../archlang/canonical-to-archlang.js';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';
import { WallType, RoomType, Direction, StairType, type Building } from '@ai-floor-planner/core';

describe('canonicalToPascal Translator', () => {

  it('translates real canonical fixture into a valid Pascal scene graph', () => {
    const building = createMockCanonicalBuilding();
    const { scene } = canonicalToPascal(building);

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

    // Verify Level children count (floor slab + stair runs)
    const expectedFloor = building.floors[0]!;
    const floorWallNodes = Object.values(scene.nodes).filter((n) => n.type === 'wall' && n.parentId === levelId);
    const floorZoneNodes = Object.values(scene.nodes).filter((n) => n.type === 'zone' && n.parentId === levelId);
    const floorSlabNodes = Object.values(scene.nodes).filter((n) => n.type === 'slab' && n.parentId === levelId);
    const floorDoorNodes = Object.values(scene.nodes).filter((n) => n.type === 'door');
    const floorWindowNodes = Object.values(scene.nodes).filter((n) => n.type === 'window');

    expect(floorWallNodes.length).toBeGreaterThanOrEqual(expectedFloor.walls.length);
    expect(floorZoneNodes.length).toBe(expectedFloor.rooms.length);
    // 1 base floor slab
    expect(floorSlabNodes.length).toBe(1);
    const floorStairNodes = Object.values(scene.nodes).filter((n) => n.type === 'stair' && n.parentId === levelId);
    expect(floorStairNodes.length).toBe(expectedFloor.stairs?.length ?? 0);
    expect(floorDoorNodes.length).toBe(expectedFloor.doors.length);
    expect(floorWindowNodes.length).toBe(expectedFloor.windows.length);

    // Verify parent-child integrity across ALL nodes
    for (const [id, node] of Object.entries(scene.nodes)) {
      expect(node.id).toBe(id);

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
        case 'stair':
          expect(StairNode.safeParse(node).success).toBe(true);
          break;
        case 'stair-segment':
          expect(StairSegmentNode.safeParse(node).success).toBe(true);
          break;
      }

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
    const sitePoly = siteNode.polygon.points;
    expect(sitePoly).toContainEqual([30, 25]);

    // Wall height: 3100 mm -> 3.1 m
    const sampleWall = floorWallNodes[0] as any;
    expect(sampleWall.height).toBeCloseTo(3.1);

    // Site zones preserved in typed metadata
    expect((siteNode.metadata as any)?.siteZones?.length).toBeGreaterThan(0);
  });

  it('translates multiple floor archetypes (stilt parking, residential, terrace) cleanly', () => {
    const multiFloorBuilding = createMockCanonicalBuilding();
    // Add stilt ground floor
    const stiltFloor = {
      ...multiFloorBuilding.floors[0]!,
      id: 'floor-stilt-0',
      name: 'Stilt Parking Floor',
      level: 0,
      floorHeight: 2800,
      rooms: [
        {
          id: 'room-stilt-parking',
          name: 'Covered Stilt Parking',
          type: RoomType.Parking,
          boundary: multiFloorBuilding.floors[0]!.boundary,
          area: 80000000,
          targetArea: 80000000,
          dimensions: { width: 10000, length: 8000 },
          center: { x: 5000, y: 4000 },
          doors: [],
          windows: [],
        },
      ],
      walls: [
        {
          id: 'wall-stilt-1',
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 10000, y: 0 },
          thickness: 230,
          type: WallType.External,
          loadBearing: true,
          wallUse: 'SHEAR',
        },
      ],
      doors: [],
      windows: [],
      stairs: [
        {
          id: 'stair-stilt-1',
          floorId: 'floor-stilt-0',
          type: StairType.Straight,
          x: 12000,
          y: 2000,
          width: 1500,
          length: 3600,
          riserCount: 18,
          riserHeight: 155,
          treadDepth: 250,
          landingWidth: 1500,
          direction: Direction.North,
          connectsFloors: [0, 1] as const,
          boundary: {
            points: [
              { x: 12000, y: 2000 },
              { x: 13500, y: 2000 },
              { x: 13500, y: 5600 },
              { x: 12000, y: 5600 },
            ],
          },
        },
      ],
    };

    // Add terrace floor
    const terraceFloor = {
      ...multiFloorBuilding.floors[0]!,
      id: 'floor-terrace-2',
      name: 'Rooftop Terrace',
      level: 2,
      floorHeight: 1200,
      rooms: [
        {
          id: 'room-terrace',
          name: 'Open Sky Terrace',
          type: RoomType.Balcony,
          boundary: multiFloorBuilding.floors[0]!.boundary,
          area: 95000000,
          targetArea: 95000000,
          dimensions: { width: 10000, length: 9500 },
          center: { x: 5000, y: 4750 },
          doors: [],
          windows: [],
        },
      ],
      walls: [],
      doors: [],
      windows: [],
      stairs: [],
    };

    const multiBuilding = {
      ...multiFloorBuilding,
      floors: [stiltFloor, multiFloorBuilding.floors[0]!, terraceFloor],
    } as unknown as Building;

    // Verify Pascal scene translation across all 3 floors
    const { scene } = canonicalToPascal(multiBuilding);
    const levelNodes = Object.values(scene.nodes).filter((n) => n.type === 'level');
    expect(levelNodes.length).toBe(3);

    // Verify ArchLang compilation across all 3 floors
    for (const floor of multiBuilding.floors) {
      const dslSource = canonicalToArchLang(multiBuilding, floor.id);
      expect(dslSource).toContain('plan');
      expect(dslSource).toContain(floor.name);
    }

    // Stage F: SiteNode visible=false suppresses intersecting Pascal cream ground plane, and Roof gets parapet walls
    const siteNode = Object.values(scene.nodes).find((n) => n.type === 'site');
    expect(siteNode?.visible).toBe(false);
    const terraceLevel = levelNodes.find((l: any) => l.name === 'Rooftop Terrace') as any;
    const terraceWalls = Object.values(scene.nodes).filter(
      (n) => n.type === 'wall' && n.parentId === terraceLevel.id,
    );
    expect(terraceWalls.length).toBeGreaterThanOrEqual(3);
  });

  it('normalizes legacy furniture types onto verified offline GLB files and avoids item.glb 404s', () => {
    const glbDir = path.resolve(__dirname, '../../../pascal-studio/public/assets/furniture');
    for (const kind of KNOWN_FURNITURE_GLB_KINDS) {
      expect(fs.existsSync(path.join(glbDir, `${kind}.glb`))).toBe(true);
    }

    const building = createMockCanonicalBuilding() as any;
    const floor = building.floors[0];
    floor.furniture = [
      { id: 'f1', type: 'sectional_sofa', label: 'Living Sofa', xMm: 1000, yMm: 1000, widthMm: 2100, depthMm: 850, heightMm: 820 },
      { id: 'f2', type: 'car', label: 'Sedan Car', xMm: 2000, yMm: 2000, widthMm: 1850, depthMm: 4300, heightMm: 1450 },
      { id: 'f3', type: 'toilet', label: 'WC', xMm: 3000, yMm: 1000, widthMm: 400, depthMm: 680, heightMm: 760 },
      { id: 'f4', type: 'counter', label: 'Kitchen Counter', xMm: 4000, yMm: 1000, widthMm: 2200, depthMm: 600, heightMm: 860 },
      { id: 'f5', type: 'desk', label: 'Study Desk', xMm: 4000, yMm: 3000, widthMm: 1200, depthMm: 600, heightMm: 750 },
    ];

    const { scene } = canonicalToPascal(building);
    const itemNodes = Object.values(scene.nodes).filter((n: any) => n.type === 'item') as any[];
    expect(itemNodes.length).toBe(5);
    for (const item of itemNodes) {
      expect(item.asset?.src).not.toContain('item.glb');
      const relFile = path.basename(item.asset?.src ?? '');
      expect(fs.existsSync(path.join(glbDir, relFile))).toBe(true);
    }
    expect(resolveFurnitureAssetKind({ type: 'sectional_sofa' })).toBe('sofa_3seater');
    expect(resolveFurnitureAssetKind({ type: 'car' })).toBe('car_sedan');
  });
});
