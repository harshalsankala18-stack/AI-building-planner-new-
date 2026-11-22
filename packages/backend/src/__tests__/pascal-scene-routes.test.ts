import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import fs from 'node:fs';
import { createBackendServer } from '../server.js';
import { resolveServiceConfig } from '../env.js';
import { getSceneFilePath } from '../api/pascal-scene-routes.js';

describe('Pascal Scene HTTP Routes', () => {
  let server: Server;
  let baseUrl = '';
  const testProjectId = 'test-proj-phase2-http';
  const filePath = getSceneFilePath(testProjectId);

  beforeAll(async () => {
    // Ensure clean state before tests
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    const config = resolveServiceConfig();
    server = createBackendServer({ gemini: null, briefInterpreterKind: 'local-stub', config });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterAll(async () => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('GET /api/projects/:projectId/pascal-scene returns generated scene from canonical fixture when not saved', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene`);
    expect(res.status).toBe(200);

    const data = await res.json() as any;
    expect(data.source).toBe('generated');
    expect(data.scene).toBeDefined();
    expect(Array.isArray(data.scene.rootNodeIds)).toBe(true);
    expect(data.scene.rootNodeIds.length).toBeGreaterThan(0);

    const rootId = data.scene.rootNodeIds[0];
    const rootNode = data.scene.nodes[rootId];
    expect(rootNode).toBeDefined();
    expect(rootNode.type).toBe('site');
    expect(Array.isArray(data.warnings)).toBe(true);
  });

  it('PUT /api/projects/:projectId/pascal-scene saves custom scene and reloads via GET', async () => {
    const customPayload = {
      scene: {
        nodes: {
          site_custom_1: {
            id: 'site_custom_1',
            type: 'site',
            name: 'Custom Pascal Site',
            children: [],
          },
        },
        rootNodeIds: ['site_custom_1'],
      },
    };

    const putRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customPayload),
    });
    expect(putRes.status).toBe(200);
    const putData = await putRes.json() as any;
    expect(putData.success).toBe(true);
    expect(putData.source).toBe('saved');
    expect(putData.nodeCount).toBe(1);

    // Verify disk persistence
    expect(fs.existsSync(filePath)).toBe(true);

    // GET should now return source: 'saved'
    const getRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene`);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json() as any;
    expect(getData.source).toBe('saved');
    expect(getData.scene.rootNodeIds).toEqual(['site_custom_1']);
    expect(getData.scene.nodes.site_custom_1.name).toBe('Custom Pascal Site');
  });

  it('POST /api/projects/:projectId/pascal-scene/reset clears saved scene and regenerates', async () => {
    const resetRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene/reset`, {
      method: 'POST',
    });
    expect(resetRes.status).toBe(200);
    const resetData = await resetRes.json() as any;
    expect(resetData.source).toBe('generated');
    expect(resetData.scene).toBeDefined();

    // Verify file is unlinked
    expect(fs.existsSync(filePath)).toBe(false);

    // Subsequent GET returns generated
    const getRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene`);
    const getData = await getRes.json() as any;
    expect(getData.source).toBe('generated');
  });

  it('PUT returns 400 for invalid payload', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/pascal-scene`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
    });
    expect(res.status).toBe(400);
    const data = await res.json() as any;
    expect(data.error?.code).toBe('INVALID_PAYLOAD');
  });
});
