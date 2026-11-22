import { describe, it, expect } from 'vitest';
import { canonicalToPascal } from '../pascal/canonical-to-pascal';
import { pascalToCanonicalPatch } from '../pascal/pascal-to-canonical';
import { canonicalToArchLang } from '../archlang/canonical-to-archlang';
import { archLangToCanonicalPatch } from '../archlang/archlang-to-canonical';
import { WallType, DoorType, RoomType, Direction, SwingDirection } from '@ai-floor-planner/core';
import type { Building } from '@ai-floor-planner/core';

function createTestCanonicalBuilding(): Building {
  return {
    id: 'bldg-sync-test',
    projectId: 'proj-sync-test',
    name: 'Sync Test Residence',
    version: 1,
    site: {
      id: 'site-1',
      plotWidth: 10000,
      plotDepth: 15000,
      plotArea: 150000000,
      plotShape: 'RECTANGULAR' as any,
      roadFacing: Direction.North,
      setbacks: { front: 2000, rear: 1000, left: 1000, right: 1000 },
      plotBoundary: {
        points: [
          { x: 0, y: 0 },
          { x: 10000, y: 0 },
          { x: 10000, y: 15000 },
          { x: 0, y: 15000 },
        ],
      },
    },
    floors: [
      {
        id: 'floor-0',
        buildingId: 'bldg-sync-test',
        level: 0,
        name: 'Ground Floor',
        floorHeight: 3000,
        boundary: {
          points: [
            { x: 1000, y: 2000 },
            { x: 9000, y: 2000 },
            { x: 9000, y: 14000 },
            { x: 1000, y: 14000 },
          ],
        },
        rooms: [
          {
            id: 'room-living',
            floorId: 'floor-0',
            name: 'Living Room',
            type: RoomType.Living,
            x: 1000,
            y: 2000,
            width: 4000,
            height: 5000,
            area: 20000000,
            rotation: 0,
            priority: 1,
            tags: [],
            adjacencyRequirements: [],
            daylightRequirement: 1 as any,
            privacyRequirement: 1 as any,
            ventilationRequired: true,
            isFixed: false,
            boundary: {
              points: [
                { x: 1000, y: 2000 },
                { x: 5000, y: 2000 },
                { x: 5000, y: 7000 },
                { x: 1000, y: 7000 },
              ],
            },
          },
          {
            id: 'room-bed',
            floorId: 'floor-0',
            name: 'Master Bedroom',
            type: RoomType.Bedroom,
            x: 5000,
            y: 2000,
            width: 4000,
            height: 5000,
            area: 20000000,
            rotation: 0,
            priority: 2,
            tags: [],
            adjacencyRequirements: [],
            daylightRequirement: 1 as any,
            privacyRequirement: 1 as any,
            ventilationRequired: true,
            isFixed: false,
            boundary: {
              points: [
                { x: 5000, y: 2000 },
                { x: 9000, y: 2000 },
                { x: 9000, y: 7000 },
                { x: 5000, y: 7000 },
              ],
            },
          },
        ],
        walls: [
          {
            id: 'wall-ext-north',
            floorId: 'floor-0',
            startPoint: { x: 1000, y: 2000 },
            endPoint: { x: 9000, y: 2000 },
            thickness: 230,
            heightMm: 3000,
            type: WallType.External,
          },
          {
            id: 'wall-partition',
            floorId: 'floor-0',
            startPoint: { x: 5000, y: 2000 },
            endPoint: { x: 5000, y: 7000 },
            thickness: 115,
            heightMm: 3000,
            type: WallType.Internal,
          },
        ],
        doors: [
          {
            id: 'door-front',
            floorId: 'floor-0',
            wallId: 'wall-ext-north',
            position: { x: 3000, y: 2000 },
            width: 1000,
            height: 2100,
            type: DoorType.Single,
            swingDirection: SwingDirection.Inward,
            connectsRooms: ['room-living', '__outside__'],
          },
        ],
        windows: [],
      },
    ],
  } as any as Building;
}

describe('Bidirectional 2D <-> 3D Synchronization', () => {
  it('round-trips Canonical -> Pascal 3D -> edit wall/door -> Canonical -> ArchLang DSL', () => {
    const baseBuilding = createTestCanonicalBuilding();

    // 1. Convert to Pascal scene
    const { scene } = canonicalToPascal(baseBuilding);
    expect(scene.nodes).toBeDefined();

    // 2. Perform a 3D mutation on Pascal scene:
    // Move the partition wall from x=5.0m to x=5.5m (meters)
    const wallNode = scene.nodes['wall_wall-partition'] as any;
    expect(wallNode).toBeDefined();
    wallNode.start = [5.5, 2.0];
    wallNode.end = [5.5, 7.0];

    // 3. Patch back to Canonical building
    const updatedBuilding = pascalToCanonicalPatch(scene, baseBuilding);
    expect(updatedBuilding.version).toBe(2);
    expect((updatedBuilding.metadata as any).lastEditedBy).toBe('3d');

    const updatedWall = updatedBuilding.floors[0]!.walls.find(w => w.id === 'wall-partition');
    expect(updatedWall).toBeDefined();
    expect(updatedWall!.startPoint.x).toBe(5500); // 5.5m -> 5500mm
    expect(updatedWall!.endPoint.x).toBe(5500);

    // 4. Generate ArchLang 2D DSL from updated canonical building
    const archSource = canonicalToArchLang(updatedBuilding, 'floor-0');
    expect(archSource).toContain('5500');
  });

  it('round-trips Canonical -> ArchLang 2D -> edit room size -> Canonical -> Pascal 3D', () => {
    const baseBuilding = createTestCanonicalBuilding();

    // 1. Convert to ArchLang DSL
    const archDsl = canonicalToArchLang(baseBuilding, 'floor-0');
    expect(archDsl).toContain('Living Room');

    // 2. Simulate AI edit on ArchLang DSL: Expand living room from 4000x5000 to 4500x5200
    const modifiedArchDsl = archDsl.replace(
      /size 4000x5000/g,
      'size 4500x5200'
    );
    expect(modifiedArchDsl).toContain('size 4500x5200');

    // 3. Patch ArchLang edit back into Canonical Building
    const updatedBuilding = archLangToCanonicalPatch(modifiedArchDsl, 'floor-0', baseBuilding);
    expect(updatedBuilding.version).toBe(2);
    expect((updatedBuilding.metadata as any).lastEditedBy).toBe('2d');

    const updatedRoom = updatedBuilding.floors[0]!.rooms.find(r => r.id === 'room-living');
    expect(updatedRoom).toBeDefined();
    expect(updatedRoom!.width).toBe(4500);
    expect(updatedRoom!.height).toBe(5200);

    // 4. Generate updated Pascal 3D scene from Canonical Building
    const { scene: updatedPascalScene } = canonicalToPascal(updatedBuilding);
    const pascalZone = updatedPascalScene.nodes['zone_room-living'] as any;
    expect(pascalZone).toBeDefined();
    // In Pascal (meters), width 4500mm -> 4.5m
    const pts = pascalZone.polygon;
    const xs = pts.map((p: [number, number]) => p[0]);
    const widthM = Math.max(...xs) - Math.min(...xs);
    expect(widthM).toBeCloseTo(4.5, 2);
  });
});
