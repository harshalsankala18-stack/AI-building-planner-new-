import type { Building, ExportFileDescriptor, IndependentExportManifest } from '@ai-floor-planner/core';
import type {
  CompileCanonicalFloorResult,
  RoomLockImpactAnalysis,
  ArchLangRoomInfo,
} from '@ai-floor-planner/interop';

export interface ArchLangPreviewOptions {
  floorId?: string;
  autoFurnish?: boolean;
  circulationOverlay?: boolean;
  showDimensions?: boolean;
  lockedRoomIds?: string[];
}

export interface ArchLangExportOptions extends ArchLangPreviewOptions {
  format?: 'svg' | 'dxf' | 'pdf' | 'arch';
}

export interface ArchLangPreviewResponse {
  preview: {
    floorId: string;
    floorName: string;
    dslSource: string;
    svg: string;
    validation: CompileCanonicalFloorResult['validation'];
    warnings: string[];
    roomMap: Record<string, ArchLangRoomInfo>;
    stats: CompileCanonicalFloorResult['stats'];
  };
}

export interface ArchLangExportResponse {
  artifact: ExportFileDescriptor;
  manifest: IndependentExportManifest;
  downloadUrl: string;
}

export interface ArchLangImpactResponse {
  impact: RoomLockImpactAnalysis;
}

async function postArchLangWithFallback<T>(
  building: Building,
  action: 'preview' | 'export' | 'impact',
  lightPayload: Record<string, unknown>,
  fullPayload: Record<string, unknown>,
  errorLabel: string,
  signal?: AbortSignal
): Promise<T> {
  const projectId = building.projectId || building.id;
  const endpoint = `/api/projects/${encodeURIComponent(projectId)}/archlang/${action}`;

  let res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lightPayload),
    signal,
  });

  if (res.status === 404) {
    const errBody = await res.json().catch(() => null);
    if (errBody?.error?.code === 'BUILDING_NOT_FOUND') {
      // Cache canonical building on backend so future ArchLang requests stay < 500 bytes
      void fetch(`/api/projects/${encodeURIComponent(projectId)}/canonical`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building }),
      }).catch(() => {});

      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
        signal,
      });
    } else {
      throw new Error(errBody?.error?.message ?? `${errorLabel} (${res.status})`);
    }
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message ?? `${errorLabel} (${res.status})`);
  }

  return (await res.json()) as T;
}

/**
 * Requests an in-process ArchLang presentation sheet preview for the selected building & floor.
 */
export async function fetchArchLangPreview(
  building: Building,
  options: ArchLangPreviewOptions = {},
  signal?: AbortSignal
): Promise<ArchLangPreviewResponse['preview']> {
  const data = await postArchLangWithFallback<ArchLangPreviewResponse>(
    building,
    'preview',
    { ...options },
    { building, ...options },
    'ArchLang preview failed',
    signal
  );
  return data.preview;
}

/**
 * Requests an ArchLang export (SVG, DXF, PDF, .arch DSL) registered and persisted in the backend.
 */
export async function requestArchLangExport(
  building: Building,
  options: ArchLangExportOptions = {},
  signal?: AbortSignal
): Promise<ArchLangExportResponse> {
  return postArchLangWithFallback<ArchLangExportResponse>(
    building,
    'export',
    { ...options },
    { building, ...options },
    'ArchLang export failed',
    signal
  );
}

/**
 * Analyzes the impact of locked rooms on floor topology, adjacency constraints, and area distribution.
 */
export async function fetchRoomLockImpact(
  building: Building,
  floorId: string,
  lockedRoomIds: string[] = [],
  targetRoomId?: string,
  signal?: AbortSignal
): Promise<RoomLockImpactAnalysis> {
  const data = await postArchLangWithFallback<ArchLangImpactResponse>(
    building,
    'impact',
    { floorId, lockedRoomIds, targetRoomId },
    { building, floorId, lockedRoomIds, targetRoomId },
    'Room lock impact analysis failed',
    signal
  );
  return data.impact;
}
