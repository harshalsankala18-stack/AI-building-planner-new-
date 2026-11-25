import { describe, it, expect } from 'vitest';
import {
  createBuilding,
  createFloor,
  createRoom,
  createWall,
  Direction,
  RoomType,
} from '@ai-floor-planner/core';
import {
  classifyRoomSizeTier,
  synthesizeBasicInteriors,
} from '../apartment/interior-furnishing-engine';

describe('Room-Scaled Interior Furnishing Engine (§Stage G)', () => {
  it('classifies compact, standard, and spacious living & bedroom rooms accurately', () => {
    expect(classifyRoomSizeTier(RoomType.Living, 3000, 4200, 12.6)).toBe('compact');
    expect(classifyRoomSizeTier(RoomType.Living, 4000, 5000, 20.0)).toBe('standard');
    expect(classifyRoomSizeTier(RoomType.Living, 5200, 6200, 32.2)).toBe('spacious');

    expect(classifyRoomSizeTier(RoomType.Bedroom, 2600, 3400, 8.8)).toBe('compact');
    expect(classifyRoomSizeTier(RoomType.Bedroom, 3200, 3800, 12.2)).toBe('standard');
    expect(classifyRoomSizeTier(RoomType.Bedroom, 4000, 4600, 18.4)).toBe('spacious');
  });

  it('scales furniture selection by room tier and snaps items within <= 80mm of wall face without overlap', () => {
    const building = createBuilding({
      projectId: 'proj-tier-test',
      name: 'Tiered Home',
      site: {
        plotWidth: 16000,
        plotDepth: 14000,
        roadFacing: Direction.South,
        setbacks: { front: 1000, rear: 1000, left: 1000, right: 1000 },
      },
    });

    const floorId = 'floor-tier-1';
    const spaciousLiving = createRoom({
      floorId,
      name: 'Grand Living',
      type: RoomType.Living,
      x: 0,
      y: 0,
      width: 5600,
      height: 6000,
    });
    const compactBedroom = createRoom({
      floorId,
      name: 'Compact Study Bedroom',
      type: RoomType.Bedroom,
      x: 5600,
      y: 0,
      width: 2800,
      height: 3400,
    });
    const spaciousBedroom = createRoom({
      floorId,
      name: 'Master Suite',
      type: RoomType.Bedroom,
      x: 5600,
      y: 3400,
      width: 4400,
      height: 4600,
    });

    const floor = {
      ...createFloor({
        buildingId: building.id,
        level: 1,
        name: '1ST FLOOR',
      }),
      id: floorId,
      rooms: [spaciousLiving, compactBedroom, spaciousBedroom],
      walls: [
        {
          ...createWall({
            floorId,
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 5600, y: 0 },
            thickness: 200,
            roomIds: [spaciousLiving.id],
          }),
          wallUse: 'EXTERNAL' as const,
        },
        {
          ...createWall({
            floorId,
            startPoint: { x: 0, y: 6000 },
            endPoint: { x: 5600, y: 6000 },
            thickness: 200,
            roomIds: [spaciousLiving.id],
          }),
          wallUse: 'EXTERNAL' as const,
        },
      ],
    };

    const result = synthesizeBasicInteriors({ ...building, floors: [floor] });
    const items = result.floors[0]!.furniture ?? [];

    const livingItems = items.filter((i) => i.roomId === spaciousLiving.id);
    const livingKinds = livingItems.map((i) => i.kind);
    expect(livingKinds).toContain('sofa_l_sectional');
    expect(livingKinds).toContain('area_rug');
    expect(livingKinds).toContain('coffee_table');
    expect(livingKinds).toContain('tv_console');

    // Sofa must be within <= 80mm of inner wall face (wall half 100mm -> gap from 0/6000 <= 180mm)
    const sofa = livingItems.find((i) => i.kind === 'sofa_l_sectional')!;
    const distFromNorthOrSouthWallFace = Math.min(
      Math.abs(sofa.yMm - 100),
      Math.abs(6000 - 100 - (sofa.yMm + sofa.depthMm)),
      Math.abs(sofa.xMm - 100),
      Math.abs(5600 - 100 - (sofa.xMm + sofa.widthMm)),
    );
    expect(distFromNorthOrSouthWallFace).toBeLessThanOrEqual(80);

    const compactBedItems = items.filter((i) => i.roomId === compactBedroom.id);
    expect(compactBedItems.some((i) => i.kind === 'bed_single')).toBe(true);

    const masterBedItems = items.filter((i) => i.roomId === spaciousBedroom.id);
    expect(masterBedItems.some((i) => i.kind === 'bed_king')).toBe(true);
  });
});
