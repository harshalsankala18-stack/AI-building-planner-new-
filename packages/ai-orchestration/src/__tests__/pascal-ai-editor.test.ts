import { describe, it, expect } from 'vitest';
import {
  PascalAIEditor,
  deterministicPascalOperations,
} from '../editing/pascal-ai-editor';
import {
  canonicalToPascal,
  applyPascalOperations,
} from '@ai-floor-planner/interop';
import {
  type Building,
  RoomType,
  WallType,
} from '@ai-floor-planner/core';

function createMockBuildingForPascal(): Building {
  return {
    id: 'test_bldg_1',
    name: 'Sample Test Building',
    projectId: 'proj_1',
    version: 1,
    status: 'draft',
    site: {
      id: 'site_1',
      plotWidth: 20000,
      plotDepth: 20000,
      setbacks: { front: 3000, rear: 3000, left: 2000, right: 2000 },
      plotBoundary: {
        points: [
          { x: 0, y: 0 },
          { x: 20000, y: 0 },
          { x: 20000, y: 20000 },
          { x: 0, y: 20000 },
        ],
      },
    },
    floors: [
      {
        id: 'floor_0',
        name: 'Ground Floor',
        level: 0,
        floorHeight: 3000,
        rooms: [
          {
            id: 'room_living',
            name: 'Living Room',
            type: RoomType.Living,
            x: 1000,
            y: 1000,
            width: 7000,
            height: 6000,
            area: 42000000,
          },
          {
            id: 'room_bed',
            name: 'Master Bedroom',
            type: RoomType.Bedroom,
            x: 8000,
            y: 1000,
            width: 5000,
            height: 5000,
            area: 25000000,
          },
        ],
        walls: [
          {
            id: 'wall_north',
            type: WallType.External,
            startPoint: { x: 0, y: 15000 },
            endPoint: { x: 15000, y: 15000 },
            thickness: 200,
          },
          {
            id: 'wall_south',
            type: WallType.External,
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 15000, y: 0 },
            thickness: 200,
          },
        ],
        doors: [],
        windows: [],
      },
    ],
  } as unknown as Building;
}

describe('PascalAIEditor (Phase 4 Headless 3D AI Editing)', () => {
  it('furnishes living room with sofa and dining table within zone boundaries', async () => {
    const building = createMockBuildingForPascal();
    const { scene } = canonicalToPascal(building);
    const editor = new PascalAIEditor();

    const result = await editor.editPascalScene({
      scene,
      prompt: 'Furnish the living room with a sofa and dining table',
    });

    expect(result.status).toBe('applied');
    expect(result.appliedOperations.length).toBeGreaterThanOrEqual(2);
    expect(result.refusals.length).toBe(0);

    // Verify item nodes added to scene
    const itemNodes = Object.values(result.scene.nodes).filter((n) => n.type === 'item');
    expect(itemNodes.length).toBe(2);
    expect(itemNodes.some((i) => i.name && i.name.includes('Sofa'))).toBe(true);
    expect(itemNodes.some((i) => i.name && i.name.includes('Dining Table'))).toBe(true);
  });

  it('adds window on north wall with valid parametric bounds', async () => {
    const building = createMockBuildingForPascal();
    const { scene } = canonicalToPascal(building);
    const editor = new PascalAIEditor();

    const result = await editor.editPascalScene({
      scene,
      prompt: 'Add a window on the north wall',
    });

    expect(result.status).toBe('applied');
    expect(result.refusals.length).toBe(0);

    const winNodes = Object.values(result.scene.nodes).filter((n) => n.type === 'window');
    expect(winNodes.length).toBe(1);

    const win = winNodes[0] as any;
    expect(win.parentId).toBe('wall_north');
    expect(win.position[0]).toBeGreaterThanOrEqual(0);
    expect(win.position[0] + win.width).toBeLessThanOrEqual(15.0);
  });

  it('refuses invalid mutation and self-heals in attempt 2', async () => {
    const building = createMockBuildingForPascal();
    const { scene } = canonicalToPascal(building);

    // Directly test mutator refusal when window exceeds wall length
    const badOpResult = applyPascalOperations(scene, [
      {
        type: 'add_opening',
        wallId: 'wall_north',
        openingType: 'window',
        offset: 14.5,
        width: 2.0, // 14.5 + 2.0 = 16.5 > wall length 15.0!
      },
    ]);
    expect(badOpResult.success).toBe(false);
    expect(badOpResult.refusals.length).toBe(1);
    expect(badOpResult.refusals[0]).toContain('exceeds wall');

    // PascalAIEditor self-heals on second attempt
    const editor = new PascalAIEditor();
    const result = await editor.editPascalScene({
      scene,
      prompt: 'Add a window on the north wall',
      maxAttempts: 2,
    });
    expect(result.status).toBe('applied');
  });

  it('deterministicPascalOperations parses wall update instruction', () => {
    const building = createMockBuildingForPascal();
    const { scene } = canonicalToPascal(building);
    const ops = deterministicPascalOperations(scene, 'Update wall thickness to 0.25m');
    expect(ops.length).toBe(1);
    expect(ops[0]?.type).toBe('update_wall');
  });
});
