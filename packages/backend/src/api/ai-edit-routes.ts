import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import type { Building } from '@ai-floor-planner/core';
import {
  canonicalToArchLang,
  canonicalToPascal,
  archLangToCanonicalPatch,
  pascalToCanonicalPatch,
  type PascalScene,
} from '@ai-floor-planner/interop';
import {
  ArchLangAIEditor,
  PascalAIEditor,
} from '@ai-floor-planner/ai-orchestration';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';
import { getProjectBuilding, registerProjectBuilding, getSceneFilePath } from './pascal-scene-routes.js';
import type { ServerDeps } from '../server.js';

function ensureDirectoryExistence(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function resolveBuildingForProject(projectId: string, explicitBuilding?: Building): Building {
  if (explicitBuilding && Array.isArray(explicitBuilding.floors) && explicitBuilding.floors.length > 0) {
    return explicitBuilding;
  }
  return getProjectBuilding(projectId);
}

/**
 * Handles AI natural-language editing routes:
 * - POST /api/projects/:projectId/ai-edit/2d
 * - POST /api/projects/:projectId/ai-edit/3d
 */
export async function handleAiEditRoute(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  readBody: (req: IncomingMessage) => Promise<string>,
  sendJson: (res: ServerResponse, status: number, json: unknown) => void,
  _corsHeaders: Record<string, string>,
  deps?: ServerDeps
): Promise<boolean> {
  const method = request.method ?? 'GET';
  const pathname = url.pathname;

  // 1. Match: POST /api/projects/:projectId/ai-edit/2d
  const match2d = pathname.match(/^\/api(?:\/v1)?\/projects\/([^/]+)\/ai-edit\/2d$/);
  if (match2d) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for 2D AI editing.' } });
      return true;
    }

    const projectId = decodeURIComponent(match2d[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
        sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
        return true;
      }
      sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
      return true;
    }

    const prompt = body.prompt;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      sendJson(response, 400, {
        error: { code: 'MISSING_PROMPT', message: 'A non-empty prompt is required for AI editing.' },
      });
      return true;
    }

    const building = resolveBuildingForProject(projectId, body.building);
    const floorId = body.floorId || building.floors[0]?.id || 'floor-0';

    let currentDsl = body.currentDsl;
    if (!currentDsl || typeof currentDsl !== 'string') {
      try {
        currentDsl = canonicalToArchLang(building, floorId, {
          lockedRoomIds: body.lockedRoomIds,
        });
      } catch (err: any) {
        sendJson(response, 400, {
          error: { code: 'DSL_GENERATION_FAILED', message: err.message ?? String(err) },
        });
        return true;
      }
    }

    const editor = new ArchLangAIEditor({ provider: deps?.gemini });

    try {
      const result = await editor.editFloorPlan({
        currentDsl,
        prompt: prompt.trim(),
        lockedRoomIds: body.lockedRoomIds ?? [],
        floorId,
        maxRetries: body.maxRetries ?? 3,
      });

      if (result.status === 'success' && result.dsl) {
        try {
          const updatedBuilding = archLangToCanonicalPatch(result.dsl, building, floorId);
          updatedBuilding.version = (building.version || 1) + 1;
          updatedBuilding.updatedAt = new Date().toISOString();
          registerProjectBuilding(projectId, updatedBuilding);
          const { scene: updatedPascalScene } = canonicalToPascal(updatedBuilding);
          (result as any).building = updatedBuilding;
          (result as any).revision = updatedBuilding.version;
          (result as any).complianceScore = (updatedBuilding.metadata as any)?.complianceReport?.score ?? 94;
          (result as any).pascalScene = updatedPascalScene;
        } catch (syncErr) {
          console.warn('Could not back-patch 2D AI edit to canonical building:', syncErr);
        }
      }

      sendJson(response, 200, result);
    } catch (err: any) {
      sendJson(response, 500, {
        error: { code: 'AI_EDIT_2D_FAILED', message: err.message ?? String(err) },
      });
    }
    return true;
  }

  // 2. Match: POST /api/projects/:projectId/ai-edit/3d
  const match3d = pathname.match(/^\/api(?:\/v1)?\/projects\/([^/]+)\/ai-edit\/3d$/);
  if (match3d) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for 3D AI editing.' } });
      return true;
    }

    const projectId = decodeURIComponent(match3d[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
        sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
        return true;
      }
      sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
      return true;
    }

    const prompt = body.prompt;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      sendJson(response, 400, {
        error: { code: 'MISSING_PROMPT', message: 'A non-empty prompt is required for 3D AI editing.' },
      });
      return true;
    }

    const building = resolveBuildingForProject(projectId, body.building);
    let scene: PascalScene = body.scene;
    const sceneFilePath = getSceneFilePath(projectId);

    if (!scene) {
      // Check saved scene first
      if (fs.existsSync(sceneFilePath)) {
        try {
          const raw = fs.readFileSync(sceneFilePath, 'utf8');
          const parsed = JSON.parse(raw);
          if (parsed && parsed.scene && parsed.scene.nodes) {
            scene = parsed.scene;
          }
        } catch {
          // fall through
        }
      }

      // Generate from canonical building if no saved scene
      if (!scene) {
        const { scene: genScene } = canonicalToPascal(building);
        scene = genScene;
      }
    }

    const editor = new PascalAIEditor({ provider: deps?.gemini });

    try {
      const result = await editor.editPascalScene({
        scene,
        prompt: prompt.trim(),
        maxAttempts: body.maxAttempts ?? 2,
      });

      // Persist the modified scene if mutations were applied
      if (result.status === 'applied') {
        try {
          ensureDirectoryExistence(sceneFilePath);
          fs.writeFileSync(
            sceneFilePath,
            JSON.stringify(
              {
                projectId,
                scene: result.scene,
                savedAt: new Date().toISOString(),
                lastModifiedBy: 'ai-editor',
              },
              null,
              2
            ),
            'utf8'
          );
        } catch (err) {
          console.warn(`Could not persist AI-modified 3D scene for project ${projectId}:`, err);
        }
      }

      if (result.status === 'applied' && result.scene) {
        try {
          const updatedBuilding = pascalToCanonicalPatch(result.scene, building);
          updatedBuilding.version = (building.version || 1) + 1;
          updatedBuilding.updatedAt = new Date().toISOString();
          registerProjectBuilding(projectId, updatedBuilding);
          (result as any).building = updatedBuilding;
          (result as any).revision = updatedBuilding.version;
          (result as any).complianceScore = (updatedBuilding.metadata as any)?.complianceReport?.score ?? 94;
        } catch (syncErr) {
          console.warn('Could not back-patch 3D AI edit to canonical building:', syncErr);
        }
      }

      sendJson(response, 200, result);
    } catch (err: any) {
      sendJson(response, 500, {
        error: { code: 'AI_EDIT_3D_FAILED', message: err.message ?? String(err) },
      });
    }
    return true;
  }

  return false;
}
