import { describe, it, expect } from 'vitest';
import {
  ArchLangAIEditor,
  deterministicArchLangEdit,
} from '../editing/archlang-ai-editor';

const SAMPLE_DSL = `plan "Apartment - Floor 1" {
  units mm
  room id=living_room at (0, 0) size 4000x3500 label "Living Room" uses living
  room id=bedroom_1 at (4000, 0) size 3500x3500 label "Master Bedroom" uses bedroom
  room id=kitchen at (0, 3500) size 3000x2500 label "Kitchen" uses kitchen
  wall id=w1 exterior thickness 200 { (0, 0) (7500, 0) }
  wall id=w2 exterior thickness 200 { (7500, 0) (7500, 6000) }
  wall id=w3 exterior thickness 200 { (7500, 6000) (0, 6000) }
  wall id=w4 exterior thickness 200 { (0, 6000) (0, 0) }
}`;

describe('ArchLangAIEditor (Phase 4 2D Lock-Aware AI Loop)', () => {
  it('applies natural-language edit deterministically offline when no rooms are locked', async () => {
    const editor = new ArchLangAIEditor();
    const result = await editor.editFloorPlan({
      currentDsl: SAMPLE_DSL,
      prompt: 'Enlarge the living room and add a study nook',
      lockedRoomIds: [],
    });

    expect(result.status).toBe('applied');
    expect(result.attempts).toBe(1);
    expect(result.dslSource).toContain('Study Nook');
    expect(result.svg).toBeTruthy();
    expect(result.svg).toContain('<svg');
  });

  it('enforces room locks and self-heals by keeping locked room unchanged', async () => {
    const editor = new ArchLangAIEditor();
    // living_room is locked
    const result = await editor.editFloorPlan({
      currentDsl: SAMPLE_DSL,
      prompt: 'Enlarge the living room and add a study nook',
      lockedRoomIds: ['living_room'],
      maxRetries: 3,
    });

    expect(result.status).toBe('applied');
    // It self-healed after attempt 1 triggered a lock violation!
    expect(result.attempts).toBeGreaterThanOrEqual(2);
    // Locked living room was preserved with its original size
    expect(result.dslSource).toContain('size 4000x3500 label "Living Room"');
    // Study nook was successfully added
    expect(result.dslSource).toContain('study_nook');
    expect(result.lockReport?.lock?.ok).toBe(true);
  });

  it('preserves locked master bedroom when living room is enlarged', async () => {
    const editor = new ArchLangAIEditor();
    // bedroom_1 is locked, living_room is free
    const result = await editor.editFloorPlan({
      currentDsl: SAMPLE_DSL,
      prompt: 'Enlarge the living room',
      lockedRoomIds: ['bedroom_1'],
    });

    expect(result.status).toBe('applied');
    expect(result.dslSource).toContain('size 3500x3500 label "Master Bedroom"');
    expect(result.lockReport?.lock?.ok).toBe(true);
  });

  it('handles room rename instructions cleanly', async () => {
    const editor = new ArchLangAIEditor();
    const result = await editor.editFloorPlan({
      currentDsl: SAMPLE_DSL,
      prompt: 'Rename Master Bedroom to "Guest Suite"',
      lockedRoomIds: [],
    });

    expect(result.status).toBe('applied');
    expect(result.dslSource).toContain('label "Guest Suite"');
  });

  it('deterministicArchLangEdit generator preserves formatting and valid syntax', () => {
    const candidate = deterministicArchLangEdit(
      SAMPLE_DSL,
      'Add a study nook',
      []
    );
    expect(candidate).toContain('plan "Apartment - Floor 1"');
    expect(candidate).toContain('study_nook');
    expect(candidate.endsWith('}')).toBe(true);
  });
});
