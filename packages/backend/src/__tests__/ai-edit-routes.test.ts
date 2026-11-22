import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import fs from 'node:fs';
import { createBackendServer } from '../server.js';
import { resolveServiceConfig } from '../env.js';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';
import { getSceneFilePath } from '../api/pascal-scene-routes.js';

describe('AI Edit HTTP Routes (Phase 4 2D & 3D AI Editing)', () => {
  let server: Server;
  let baseUrl = '';
  const testProjectId = 'test-proj-ai-edit-phase4';
  const canonicalBuilding = createMockCanonicalBuilding();

  beforeAll(async () => {
    const config = resolveServiceConfig();
    server = createBackendServer({ gemini: null, briefInterpreterKind: 'local-stub', config });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // Clean up any test scene files
    const sceneFile = getSceneFilePath(testProjectId);
    if (fs.existsSync(sceneFile)) {
      try {
        fs.unlinkSync(sceneFile);
      } catch {
        // ignore
      }
    }
  });

  it('POST /api/projects/:projectId/ai-edit/2d executes 2D edit and returns updated DSL and SVG', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/ai-edit/2d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        floorId: 'floor-0',
        prompt: 'Enlarge the living room and add a study nook',
        lockedRoomIds: [],
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.status).toBe('applied');
    expect(data.dslSource).toContain('Study Nook');
    expect(data.svg).toContain('<svg');
    expect(data.attempts).toBe(1);
  });

  it('POST /api/projects/:projectId/ai-edit/2d enforces room locks and self-heals', async () => {
    const floor = canonicalBuilding.floors[0]!;
    const livingRoom = floor.rooms.find((r) => r.type === 'living') || floor.rooms[0]!;

    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/ai-edit/2d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        floorId: floor.id,
        prompt: 'Enlarge the living room and add a study nook',
        lockedRoomIds: [livingRoom.id],
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.status).toBe('applied');
    expect(data.attempts).toBeGreaterThanOrEqual(2); // Self-healed after lock check
    expect(data.lockReport?.lock?.ok).toBe(true);
  });

  it('POST /api/projects/:projectId/ai-edit/3d furnishes room and persists 3D scene', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/ai-edit/3d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Furnish the living room with a sofa and dining table',
      }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.status).toBe('applied');
    expect(data.appliedOperations.length).toBeGreaterThanOrEqual(2);
    expect(data.scene).toBeDefined();

    // Verify item nodes in returned scene
    const items = Object.values(data.scene.nodes).filter((n: any) => n.type === 'item');
    expect(items.length).toBeGreaterThanOrEqual(2);

    // Verify scene file was persisted to disk
    const sceneFile = getSceneFilePath(testProjectId);
    expect(fs.existsSync(sceneFile)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(sceneFile, 'utf8'));
    expect(saved.projectId).toBe(testProjectId);
    expect(saved.lastModifiedBy).toBe('ai-editor');
  });

  it('returns 400 when prompt is missing', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/ai-edit/2d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error?.code).toBe('MISSING_PROMPT');
  });
});
