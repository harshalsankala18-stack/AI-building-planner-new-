import { describe, it, expect } from 'vitest';
import {
  canonicalToArchLang,
  compileCanonicalFloorWithArchLang,
  compileCanonicalFloorWithArchLangAsync,
  validateArchLang,
  analyzeRoomLockImpact,
} from '../archlang/canonical-to-archlang';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building';

describe('canonicalToArchLang Translator & Presentation Engine', () => {
  it('generates valid .arch source for a typical floor', () => {
    const building = createMockCanonicalBuilding();
    const source = canonicalToArchLang(building, 'floor-0');

    expect(source).toContain('plan "Sapphire Heights Residency - Ground Floor"');
    expect(source).toContain('units mm');

    // Rooms
    expect(source).toContain('room id=room_1 at (5000, 5000) size 5000x6000 label "Living Room 101" uses living');
    expect(source).toContain('room id=room_2 at (10000, 5000) size 5000x6000 label "Master Bedroom 101" uses bedroom');
    expect(source).toContain('room id=room_3 at (15000, 5000) size 5000x6000 label "Living Room 102" uses living');

    // Walls
    expect(source).toContain('wall id=wall_ext_1 exterior thickness 230 { (5000, 5000) (25000, 5000) }');
    expect(source).toContain('wall id=wall_party_1 partition thickness 230 { (15000, 5000) (15000, 20000) }');
    expect(source).toContain('wall id=wall_int_1 partition thickness 115 { (10000, 5000) (10000, 11000) }');

    // Door and Window
    expect(source).toContain('door id=door_1 on wall_int_1 at 2500 width 900 swing in');
    expect(source).toContain('window id=win_1 on wall_ext_1 at 2500 width 1500');

    // Stairs
    expect(source).toContain('stair id=stair_1 at (20000, 14000) size 4000x2400 dir up width 1200');
  });

  it('compiles and validates canonical floor with ArchLang producing clean SVG and roomMap', () => {
    const building = createMockCanonicalBuilding();
    const result = compileCanonicalFloorWithArchLang(building, 'floor-0');

    expect(result.validation.valid).toBe(true);
    expect(result.validation.errors).toEqual([]);
    expect(result.svg).toBeTruthy();
    expect(result.svg).toContain('<svg');
    expect(result.svg.length).toBeGreaterThan(500);

    // Verify roomMap and stats
    expect(result.roomMap['room-1']).toBeDefined();
    expect(result.roomMap['room-1']?.archId).toBe('room_1');
    expect(result.stats.roomCount).toBe(3);
    expect(result.stats.wallCount).toBe(3);
  });

  it('supports circulationOverlay option in compileCanonicalFloorWithArchLang', () => {
    const building = createMockCanonicalBuilding();
    const result = compileCanonicalFloorWithArchLang(building, 'floor-0', { circulationOverlay: true });

    expect(result.validation.valid).toBe(true);
    expect(result.svg).toBeTruthy();
    expect(result.svg).toContain('<svg');
  });

  it('supports in-process DXF export in compileCanonicalFloorWithArchLang', () => {
    const building = createMockCanonicalBuilding();
    const result = compileCanonicalFloorWithArchLang(building, 'floor-0', { format: 'dxf' });

    expect(result.dxf).toBeDefined();
    expect(typeof result.dxf).toBe('string');
    expect(result.dxf).toContain('SECTION');
    expect(result.dxf).toContain('ENTITIES');
  });

  it('supports in-process PDF export via compileCanonicalFloorWithArchLangAsync', async () => {
    const building = createMockCanonicalBuilding();
    const result = await compileCanonicalFloorWithArchLangAsync(building, 'floor-0', { format: 'pdf' });

    expect(result.pdf).toBeDefined();
    expect(result.pdf).toBeInstanceOf(Uint8Array);
    expect(result.pdf!.length).toBeGreaterThan(100);
    // Check PDF magic header %PDF
    const magic = Buffer.from(result.pdf!.subarray(0, 4)).toString('ascii');
    expect(magic).toBe('%PDF');
  });

  it('supports auto-furnishing via finish step in compileCanonicalFloorWithArchLang', () => {
    const building = createMockCanonicalBuilding();
    const result = compileCanonicalFloorWithArchLang(building, 'floor-0', { autoFurnish: true });

    expect(result.validation.valid).toBe(true);
    expect(result.validation.errors).toEqual([]);
    expect(result.svg).toBeTruthy();
    expect(result.source).toContain('furniture');
  });

  it('analyzes room lock impact and calculates adjacency and flexible area', () => {
    const building = createMockCanonicalBuilding();
    const impactResult = analyzeRoomLockImpact(building, 'floor-0', ['room-1'], 'room-2');

    expect(impactResult.floorId).toBe('floor-0');
    expect(impactResult.lockedCount).toBe(1);
    expect(impactResult.lockedRoomIds).toEqual(['room-1']);
    expect(impactResult.lockedAreaMm2).toBe(30_000_000); // 5000 x 6000
    expect(impactResult.flexibleAreaMm2).toBeGreaterThan(0);
    expect(impactResult.adjacentRoomIds).toContain('room-2'); // Room 2 is adjacent to Room 1
    expect(impactResult.targetAssessment).toBeDefined();
    expect(impactResult.targetAssessment?.status).toBe('CONSTRAINED');
  });

  it('validates syntax errors cleanly via validateArchLang', () => {
    const badSource = 'plan "Broken" { units mm\n room invalid syntax here\n }';
    const val = validateArchLang(badSource);
    expect(val.valid).toBe(false);
    expect(val.errors.length).toBeGreaterThan(0);
  });

  it('throws an error if the floorId does not exist in the building', () => {
    const building = createMockCanonicalBuilding();
    expect(() => canonicalToArchLang(building, 'non-existent-floor')).toThrowError(
      'Floor "non-existent-floor" not found'
    );
  });
});
