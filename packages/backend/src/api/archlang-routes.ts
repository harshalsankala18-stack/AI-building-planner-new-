import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import type { Building } from '@ai-floor-planner/core';
import { getProjectBuilding } from './pascal-scene-routes.js';
import {
  ArchLangExportService,
  type ArchLangPreviewOptions,
  type ArchLangExportOptions,
} from '../services/archlang-export-service.js';
import { ExportError } from '../services/export-selection.js';

const archLangService = new ArchLangExportService();

function resolveProjectBuilding(projectId: string, explicitBuilding?: Building): Building | null {
  if (explicitBuilding && Array.isArray(explicitBuilding.floors) && explicitBuilding.floors.length > 0) {
    return explicitBuilding;
  }

  const registered = getProjectBuilding(projectId, false);
  if (registered && Array.isArray(registered.floors) && registered.floors.length > 0) {
    return registered;
  }

  // Look for saved canonical building file
  const candidatePaths = [
    path.resolve(`output/canonical-buildings/${projectId}.json`),
    path.resolve(`output/${projectId}.json`),
    path.resolve(`output/cad-export/artifacts/${projectId}.json`),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
        const candidate = parsed?.building ?? parsed;
        if (candidate && Array.isArray(candidate.floors) && candidate.floors.length > 0) {
          return candidate as Building;
        }
      } catch {
        // continue search
      }
    }
  }

  return null;
}

/**
 * Handles incoming ArchLang HTTP requests:
 * - POST /api/projects/:projectId/archlang/preview
 * - POST /api/projects/:projectId/archlang/export
 * - POST /api/projects/:projectId/archlang/impact
 */
export async function handleArchLangRoute(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  readBody: (request: IncomingMessage) => Promise<string>,
  sendJson: (response: ServerResponse, status: number, body: unknown) => void,
  _corsHeaders: Record<string, string>
): Promise<boolean> {
  const match = url.pathname.match(
    /^\/api(?:\/v1)?\/(?:projects\/([^/]+)\/archlang|archlang)\/(preview|export|impact)$/
  );
  if (!match) return false;

  const projectId = match[1] ? decodeURIComponent(match[1]) : url.searchParams.get('projectId') ?? '';
  const action = match[2];

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for ArchLang operations' } });
    return true;
  }

  let body: {
    building?: Building;
    floorId?: string;
    options?: ArchLangPreviewOptions & ArchLangExportOptions;
    lockedRoomIds?: string[];
    targetRoomId?: string;
    modifiedBuilding?: Building;
    format?: 'svg' | 'dxf' | 'pdf' | 'arch';
    autoFurnish?: boolean;
    circulationOverlay?: boolean;
    showDimensions?: boolean;
  };

  try {
    const raw = await readBody(request);
    body = raw.length > 0 ? JSON.parse(raw) : {};
  } catch (err: any) {
    if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
      sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
      return true;
    }
    sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } });
    return true;
  }

  const building = resolveProjectBuilding(projectId, body.building);
  if (!building) {
    sendJson(response, 404, {
      error: {
        code: 'BUILDING_NOT_FOUND',
        message: `Building data could not be found for project "${projectId}". Pass building object in request body.`,
      },
    });
    return true;
  }

  try {
    if (action === 'preview') {
      const options: ArchLangPreviewOptions = {
        floorId: body.floorId ?? body.options?.floorId,
        autoFurnish: body.autoFurnish ?? body.options?.autoFurnish,
        circulationOverlay: body.circulationOverlay ?? body.options?.circulationOverlay,
        showDimensions: body.showDimensions ?? body.options?.showDimensions,
        lockedRoomIds: body.lockedRoomIds ?? body.options?.lockedRoomIds,
      };

      const preview = archLangService.generateArchLangPreview(building, options);
      sendJson(response, 200, { preview });
      return true;
    }

    if (action === 'export') {
      const options: ArchLangExportOptions = {
        floorId: body.floorId ?? body.options?.floorId,
        format: body.format ?? body.options?.format ?? 'svg',
        autoFurnish: body.autoFurnish ?? body.options?.autoFurnish,
        circulationOverlay: body.circulationOverlay ?? body.options?.circulationOverlay,
        showDimensions: body.showDimensions ?? body.options?.showDimensions,
        lockedRoomIds: body.lockedRoomIds ?? body.options?.lockedRoomIds,
      };

      const result = await archLangService.exportArchLangArtifact(building, options);
      sendJson(response, 200, {
        artifact: result.descriptor,
        manifest: result.manifest,
        downloadUrl: result.downloadUrl,
      });
      return true;
    }

    if (action === 'impact') {
      const floorId = body.floorId ?? body.options?.floorId ?? building.floors[0]?.id;
      if (!floorId) {
        sendJson(response, 400, {
          error: { code: 'MISSING_FLOOR_ID', message: 'floorId is required for room lock impact analysis' },
        });
        return true;
      }

      const lockedRoomIds = body.lockedRoomIds ?? body.options?.lockedRoomIds ?? [];
      const targetRoomId = body.targetRoomId;
      const modifiedBuilding = body.modifiedBuilding;

      const impact = archLangService.analyzeRoomLockImpact(
        building,
        floorId,
        lockedRoomIds,
        targetRoomId,
        modifiedBuilding
      );
      sendJson(response, 200, { impact });
      return true;
    }
  } catch (error) {
    if (error instanceof ExportError) {
      sendJson(response, error.status, {
        error: { code: error.code, message: error.message },
      });
      return true;
    }

    sendJson(response, 500, {
      error: {
        code: 'ARCHLANG_ERROR',
        message: error instanceof Error ? error.message : String(error),
      },
    });
    return true;
  }

  return false;
}
