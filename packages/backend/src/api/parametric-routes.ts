import { IncomingMessage, ServerResponse } from 'node:http';
import {
  resolveParametricRipple,
  pushProjectRevision,
  popProjectRevision,
  type ParametricChangeEvent,
  type ParametricRippleOptions,
} from '@ai-floor-planner/ai-orchestration';
import { canonicalToPascal } from '@ai-floor-planner/interop';
import type { Building } from '@ai-floor-planner/core';
import { getProjectBuilding, registerProjectBuilding } from './pascal-scene-routes.js';
import type { ProjectRepository } from '../persistence/project-repository.js';

export async function handleParametricRoute(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  readBody: (req: IncomingMessage) => Promise<string>,
  sendJson: (res: ServerResponse, status: number, body: unknown) => void,
  _corsHeaders: Record<string, string>,
  deps: { repository?: ProjectRepository },
): Promise<boolean> {
  const method = request.method ?? 'GET';

  // 1. POST /api/projects/:projectId/parametric-edit
  const editMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/parametric-edit$/);
  if (method === 'POST' && editMatch) {
    const projectId = decodeURIComponent(editMatch[1] ?? '');
    const raw = await readBody(request);
    let payload: any = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
      return true;
    }

    const changeEvent: ParametricChangeEvent = payload.changeEvent ?? payload;
    const options: ParametricRippleOptions = payload.options ?? {};

    // Get current building
    let building: Building | null = payload.building ?? getProjectBuilding(projectId, true);
    if (!building && deps.repository) {
      try {
        const snap = await deps.repository.getProjectSnapshot(projectId);
        building = (snap?.building as Building) ?? null;
      } catch {
        // Fall back to registry
      }
    }

    if (!building) {
      sendJson(response, 404, {
        error: { code: 'PROJECT_NOT_FOUND', message: `Building not found for project ${projectId}.` },
      });
      return true;
    }

    // Push prior state to undo stack
    pushProjectRevision(projectId, building);

    // Run parametric ripple cascade
    const result = resolveParametricRipple(building, changeEvent, options);

    if (result.status === 'blocked') {
      sendJson(response, 409, {
        status: 'blocked',
        conflictReason: result.conflictReason,
        previousBuilding: result.previousBuilding,
      });
      return true;
    }

    const updatedBuilding = result.building!;
    registerProjectBuilding(projectId, updatedBuilding);

    if (deps.repository) {
      try {
        await deps.repository.saveProjectSnapshot(projectId, { building: updatedBuilding });
      } catch (err) {
        console.warn(`[ParametricRoute] Failed to persist snapshot for ${projectId}:`, err);
      }
    }

    // Convert updated building to Pascal 3D scene
    let scene = null;
    try {
      scene = canonicalToPascal(updatedBuilding, { synthesizeWalls: true });
    } catch (err) {
      console.warn(`[ParametricRoute] Failed to convert to Pascal scene:`, err);
    }

    sendJson(response, 200, {
      status: 'success',
      building: updatedBuilding,
      scene,
      summary: result.summary,
      complianceScore: result.complianceScore,
      affectedRoomIds: result.affectedRoomIds,
      affectedWallIds: result.affectedWallIds,
    });
    return true;
  }

  // 2. POST /api/projects/:projectId/parametric-undo
  const undoMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/parametric-undo$/);
  if (method === 'POST' && undoMatch) {
    const projectId = decodeURIComponent(undoMatch[1] ?? '');
    const priorBuilding = popProjectRevision(projectId);

    if (!priorBuilding) {
      sendJson(response, 400, {
        status: 'no_undo',
        error: { code: 'NO_PREVIOUS_REVISION', message: 'No parametric undo state available for this project.' },
      });
      return true;
    }

    registerProjectBuilding(projectId, priorBuilding);

    if (deps.repository) {
      try {
        await deps.repository.saveProjectSnapshot(projectId, { building: priorBuilding });
      } catch (err) {
        console.warn(`[ParametricRoute] Failed to persist undone snapshot for ${projectId}:`, err);
      }
    }

    let scene = null;
    try {
      scene = canonicalToPascal(priorBuilding, { synthesizeWalls: true });
    } catch (err) {
      console.warn(`[ParametricRoute] Failed to convert undone building to Pascal scene:`, err);
    }

    sendJson(response, 200, {
      status: 'undone',
      building: priorBuilding,
      scene,
      summary: 'Reverted to previous parametric revision.',
    });
    return true;
  }

  return false;
}
