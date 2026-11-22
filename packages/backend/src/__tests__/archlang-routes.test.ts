import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import { createBackendServer } from '../server.js';
import { resolveServiceConfig } from '../env.js';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';

describe('ArchLang HTTP Routes', () => {
  let server: Server;
  let baseUrl = '';
  const testProjectId = 'test-proj-archlang-phase3';
  const canonicalBuilding = createMockCanonicalBuilding();

  beforeAll(async () => {
    const config = resolveServiceConfig();
    server = createBackendServer({ gemini: null, briefInterpreterKind: 'local-stub', config });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('POST /api/projects/:projectId/archlang/preview returns compiled SVG and roomMap', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        options: {
          autoFurnish: true,
          circulationOverlay: true,
          showDimensions: true,
        },
      }),
    });

    const data = (await res.json()) as any;
    if (res.status !== 200) console.error('Preview error:', data);
    expect(res.status).toBe(200);
    expect(data.preview).toBeDefined();
    expect(data.preview.floorId).toBe('floor-0');
    expect(data.preview.svg).toContain('<svg');
    expect(data.preview.dslSource).toContain('plan');
    expect(data.preview.validation).toBeDefined();
    expect(data.preview.validation.valid).toBe(true);
    expect(data.preview.roomMap).toBeDefined();
    expect(data.preview.stats.roomCount).toBeGreaterThan(0);
  });

  it('POST /api/projects/:projectId/archlang/export produces verified and downloadable artifacts (SVG & DXF & PDF)', async () => {
    // 1. Export SVG
    const svgRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        format: 'svg',
        options: { autoFurnish: true },
      }),
    });
    const svgData = (await svgRes.json()) as any;
    if (svgRes.status !== 200) console.error('Export error:', svgData);
    expect(svgRes.status).toBe(200);
    expect(svgData.artifact).toBeDefined();
    expect(svgData.artifact.fileType).toBe('SVG');
    expect(svgData.downloadUrl).toBeDefined();

    // Verify download works
    const dlSvg = await fetch(`${baseUrl}${svgData.downloadUrl}`);
    expect(dlSvg.status).toBe(200);
    expect(dlSvg.headers.get('content-type')).toContain('svg');

    // 2. Export DXF
    const dxfRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        format: 'dxf',
      }),
    });
    expect(dxfRes.status).toBe(200);
    const dxfData = (await dxfRes.json()) as any;
    expect(dxfData.artifact.fileType).toBe('DXF');

    // 3. Export PDF
    const pdfRes = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        format: 'pdf',
      }),
    });
    expect(pdfRes.status).toBe(200);
    const pdfData = (await pdfRes.json()) as any;
    expect(pdfData.artifact.fileType).toBe('PDF');
  });

  it('POST /api/projects/:projectId/archlang/impact returns room lock adjacency and impact assessment', async () => {
    const floor = canonicalBuilding.floors[0]!;
    const room1 = floor.rooms[0]!;
    const room2 = floor.rooms[1]!;

    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/impact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        floorId: floor.id,
        lockedRoomIds: [room1.id],
        targetRoomId: room2.id,
      }),
    });

    const data = (await res.json()) as any;
    if (res.status !== 200) console.error('Preview error:', data);
    expect(res.status).toBe(200);
    expect(data.impact).toBeDefined();
    expect(data.impact.floorId).toBe(floor.id);
    expect(data.impact.lockedCount).toBe(1);
    expect(data.impact.lockedRoomIds).toEqual([room1.id]);
    expect(data.impact.flexibleAreaMm2).toBeGreaterThan(0);
    expect(data.impact.targetAssessment).toBeDefined();
    expect(data.impact.method).toBe('TOPOLOGICAL_ADJACENCY_GRAPH');
  });

  it('returns 404 for non-existent floorId', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: canonicalBuilding,
        floorId: 'floor-does-not-exist',
      }),
    });

    expect(res.status).toBe(404);
    const data = (await res.json()) as any;
    expect(data.error?.code).toBe('FLOOR_NOT_FOUND');
  });

  it('returns 400 for invalid JSON body', async () => {
    const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/archlang/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not a json',
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error?.code).toBe('INVALID_JSON');
  });
});
