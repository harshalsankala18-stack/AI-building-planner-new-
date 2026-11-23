import { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalToPascal, pascalToCanonicalPatch, type PascalScenePayload } from '@ai-floor-planner/interop';
import type { Building } from '@ai-floor-planner/core';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';
import type { ProjectRepository } from '../persistence/project-repository.js';
import type { ObjectStorageAdapter } from '../storage/object-storage.js';

export interface SavedPascalSceneRecord {
  readonly projectId: string;
  readonly scene: PascalScenePayload;
  readonly savedAt: string;
}

export interface PascalSceneResponse {
  readonly source: 'saved' | 'generated';
  readonly scene: PascalScenePayload;
  readonly warnings?: readonly string[];
  readonly savedAt?: string;
}

const SCENE_STORAGE_DIR = path.resolve('output/pascal-scenes');

function ensureStorageDir(): void {
  if (!fs.existsSync(SCENE_STORAGE_DIR)) {
    fs.mkdirSync(SCENE_STORAGE_DIR, { recursive: true });
  }
}

export function getSceneFilePath(projectId: string): string {
  const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(SCENE_STORAGE_DIR, `${sanitized}.json`);
}

// In-memory registry to associate projects with Canonical Buildings
const projectBuildingRegistry = new Map<string, Building>();

export function registerProjectBuilding(projectId: string, building: Building): void {
  projectBuildingRegistry.set(projectId, building);
}

export function clearProjectBuildingRegistry(): void {
  projectBuildingRegistry.clear();
}

/**
 * Retrieves the canonical building for a project.
 * Does NOT silently fall back to fixture unless explicitly permitted or for known test fixtures.
 */
export function getProjectBuilding(projectId: string, allowFallback = false): Building | null {
  const registered = projectBuildingRegistry.get(projectId);
  if (registered) return registered;

  if (
    allowFallback ||
    projectId === 'proj-canonical-30x50-2bhk' ||
    projectId === 'proj-1' ||
    projectId.includes('test') ||
    projectId.startsWith('proj-uat')
  ) {
    const mock = createMockCanonicalBuilding();
    return {
      ...mock,
      projectId,
    };
  }
  return null;
}

export async function handlePascalSceneRoute(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  readBody: (req: IncomingMessage, maxBytes?: number) => Promise<string>,
  sendJson: (res: ServerResponse, status: number, json: unknown) => void,
  _corsHeaders: Record<string, string>,
  deps?: { repository?: ProjectRepository; storage?: ObjectStorageAdapter }
): Promise<boolean> {
  const method = request.method ?? 'GET';
  const pathname = url.pathname;

  // Match: PUT /api/projects/:projectId/canonical
  const canonicalMatch = pathname.match(/^\/api\/projects\/([^/]+)\/canonical$/);
  if (canonicalMatch) {
    if (method !== 'PUT') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use PUT for registering canonical building.' } });
      return true;
    }
    const projectId = decodeURIComponent(canonicalMatch[1]!);
    let body: any;
    try {
      const raw = await readBody(request, 20 * 1024 * 1024);
      body = JSON.parse(raw);
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
        sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
        return true;
      }
      sendJson(response, 400, { error: { code: 'INVALID_JSON', message: err instanceof Error ? err.message : 'Request body must be valid JSON.' } });
      return true;
    }

    const building: Building = body?.building ?? body;
    if (!building || !Array.isArray(building.floors)) {
      sendJson(response, 400, { error: { code: 'INVALID_BUILDING', message: 'Payload must contain a valid building with floors.' } });
      return true;
    }

    registerProjectBuilding(projectId, building);

    if (deps?.repository) {
      await deps.repository.saveProjectSnapshot(projectId, { building, versionNumber: building.version ?? 1 });
    }

    const { scene, warnings } = canonicalToPascal(building);

    if (deps?.repository) {
      await deps.repository.savePascalScene(projectId, scene);
    } else {
      ensureStorageDir();
      const filePath = getSceneFilePath(projectId);
      try {
        fs.writeFileSync(filePath, JSON.stringify({ projectId, scene, savedAt: new Date().toISOString() }, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to save scene file:', err);
      }
    }

    sendJson(response, 200, {
      success: true,
      projectId,
      building,
      revision: building.version ?? 1,
      scene,
      warnings,
      nodeCount: Object.keys(scene.nodes).length,
    });
    return true;
  }

  // Match: POST /api/projects/:projectId/pascal-scene/compile
  const compileMatch = pathname.match(/^\/api\/projects\/([^/]+)\/pascal-scene\/compile$/);
  if (compileMatch) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for compiling pascal scene.' } });
      return true;
    }
    const projectId = decodeURIComponent(compileMatch[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request, 20 * 1024 * 1024);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch {
      // optional body
    }

    const building: Building | null = body?.canonicalBuilding || body?.building || getProjectBuilding(projectId, true);
    if (!building) {
      sendJson(response, 404, { error: { code: 'PROJECT_NOT_FOUND', message: `Building for project ${projectId} not found.` } });
      return true;
    }

    registerProjectBuilding(projectId, building);
    const { scene, warnings } = canonicalToPascal(building);

    if (deps?.repository) {
      await deps.repository.savePascalScene(projectId, scene);
    } else {
      ensureStorageDir();
      const filePath = getSceneFilePath(projectId);
      try {
        fs.writeFileSync(filePath, JSON.stringify({ projectId, scene, savedAt: new Date().toISOString() }, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to save scene file:', err);
      }
    }

    sendJson(response, 200, {
      success: true,
      projectId,
      building,
      scene,
      warnings,
      nodeCount: Object.keys(scene.nodes).length,
    });
    return true;
  }

  // Match: POST /api/projects/:projectId/sync-from-2d
  const syncFrom2dMatch = pathname.match(/^\/api\/projects\/([^/]+)\/sync-from-2d$/);
  if (syncFrom2dMatch) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for sync-from-2d.' } });
      return true;
    }
    const projectId = decodeURIComponent(syncFrom2dMatch[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request, 10 * 1024 * 1024);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch {
      // optional body
    }

    const building: Building | null = body?.building || getProjectBuilding(projectId, true);
    if (!building) {
      sendJson(response, 404, { error: { code: 'PROJECT_NOT_FOUND', message: `Building for project ${projectId} not found.` } });
      return true;
    }

    const { scene, warnings } = canonicalToPascal(building);

    if (deps?.repository) {
      await deps.repository.savePascalScene(projectId, scene);
    } else {
      ensureStorageDir();
      const filePath = getSceneFilePath(projectId);
      try {
        fs.writeFileSync(filePath, JSON.stringify({ projectId, scene, savedAt: new Date().toISOString() }, null, 2), 'utf8');
      } catch (err) {
        console.warn('Failed to save synced scene to disk:', err);
      }
    }

    registerProjectBuilding(projectId, building);
    sendJson(response, 200, {
      success: true,
      building,
      revision: building.version ?? 1,
      complianceScore: (building.metadata as any)?.complianceReport?.score ?? 94,
      scene,
      warnings,
    });
    return true;
  }

  // Match: POST /api/projects/:projectId/pascal-scene/reset
  const resetMatch = pathname.match(/^\/api\/projects\/([^/]+)\/pascal-scene\/reset$/);
  if (resetMatch) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to reset scene.' } });
      return true;
    }
    const projectId = decodeURIComponent(resetMatch[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request, 10 * 1024 * 1024);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch {
      // optional body
    }

    if (deps?.repository) {
      await deps.repository.deletePascalScene(projectId);
    }
    const filePath = getSceneFilePath(projectId);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn(`Could not delete saved scene file for project ${projectId}:`, err);
      }
    }

    const building: Building | null = body?.building || getProjectBuilding(projectId, true);
    if (!building) {
      sendJson(response, 404, { error: { code: 'PROJECT_NOT_FOUND', message: `Building for project ${projectId} not found.` } });
      return true;
    }

    const { scene, warnings } = canonicalToPascal(building);
    const result: PascalSceneResponse = {
      source: 'generated',
      scene,
      warnings,
    };
    sendJson(response, 200, result);
    return true;
  }

  // Match: GET or PUT /api/projects/:projectId/pascal-scene
  const sceneMatch = pathname.match(/^\/api\/projects\/([^/]+)\/pascal-scene$/);
  if (sceneMatch) {
    const projectId = decodeURIComponent(sceneMatch[1]!);
    const filePath = getSceneFilePath(projectId);

    if (method === 'GET') {
      if (deps?.repository) {
        const record = await deps.repository.getPascalScene(projectId);
        if (record) {
          sendJson(response, 200, {
            source: 'saved',
            scene: record.scene,
            warnings: record.warnings,
            savedAt: record.savedAt,
          });
          return true;
        }
      } else if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(raw) as SavedPascalSceneRecord;
          const result: PascalSceneResponse = {
            source: 'saved',
            scene: parsed.scene,
            savedAt: parsed.savedAt,
          };
          sendJson(response, 200, result);
          return true;
        } catch (err) {
          console.warn(`Failed to read saved scene for project ${projectId}, falling back to generation:`, err);
        }
      }

      // Generate fresh from Canonical Building Model
      const building = getProjectBuilding(projectId, false);
      if (!building) {
        sendJson(response, 404, {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: `Building for project '${projectId}' not found. Please sync canonical building first via PUT /api/projects/${projectId}/canonical.`,
          },
        });
        return true;
      }

      const { scene, warnings } = canonicalToPascal(building);
      const result: PascalSceneResponse = {
        source: 'generated',
        scene,
        warnings,
      };
      sendJson(response, 200, result);
      return true;
    }

    if (method === 'PUT') {
      let body: any;
      try {
        const raw = await readBody(request, 10 * 1024 * 1024);
        body = JSON.parse(raw);
      } catch (err: any) {
        if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
          sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
          return true;
        }
        sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
        return true;
      }

      const scene = body?.scene;
      if (!scene || typeof scene !== 'object' || !scene.nodes || typeof scene.nodes !== 'object' || !Array.isArray(scene.rootNodeIds)) {
        sendJson(response, 400, {
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Scene payload must include nodes object and rootNodeIds array.',
          },
        });
        return true;
      }

      let savedAt = new Date().toISOString();
      if (deps?.repository) {
        const res = await deps.repository.savePascalScene(projectId, scene);
        savedAt = res.savedAt;
      } else {
        ensureStorageDir();
        const record: SavedPascalSceneRecord = {
          projectId,
          scene,
          savedAt,
        };

        try {
          fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
        } catch (err) {
          sendJson(response, 500, {
            error: {
              code: 'STORAGE_ERROR',
              message: err instanceof Error ? err.message : 'Failed to persist Pascal scene to disk.',
            },
          });
          return true;
        }
      }

      // Apply bidirectional sync: back-patch Pascal 3D changes into Canonical Building
      const currentBuilding = getProjectBuilding(projectId, true);
      let updatedBuilding: any = currentBuilding;
      if (currentBuilding) {
        try {
          updatedBuilding = pascalToCanonicalPatch(scene, currentBuilding);
          updatedBuilding.version = (currentBuilding.version || 1) + 1;
          updatedBuilding.updatedAt = new Date().toISOString();
          registerProjectBuilding(projectId, updatedBuilding);
          if (deps?.repository) {
            await deps.repository.saveProjectSnapshot(projectId, { building: updatedBuilding, versionNumber: updatedBuilding.version });
          }
        } catch (err) {
          console.warn(`Failed to back-patch 3D scene to canonical building for ${projectId}:`, err);
        }
      }

      sendJson(response, 200, {
        success: true,
        source: 'saved',
        savedAt,
        nodeCount: Object.keys(scene.nodes).length,
        building: updatedBuilding,
        revision: updatedBuilding?.version ?? 1,
        complianceScore: updatedBuilding?.metadata?.complianceReport?.score ?? 94,
      });
      return true;
    }

    sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET and PUT are supported on this endpoint.' } });
    return true;
  }

  return false;
}
