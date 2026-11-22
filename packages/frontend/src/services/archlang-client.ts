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

/**
 * Requests an in-process ArchLang presentation sheet preview for the selected building & floor.
 */
export async function fetchArchLangPreview(
  building: Building,
  options: ArchLangPreviewOptions = {},
  signal?: AbortSignal
): Promise<ArchLangPreviewResponse['preview']> {
  const projectId = building.projectId || building.id;
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/archlang/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ building, ...options }),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message ?? `ArchLang preview failed (${res.status})`);
  }

  const data = (await res.json()) as ArchLangPreviewResponse;
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
  const projectId = building.projectId || building.id;
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/archlang/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ building, ...options }),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message ?? `ArchLang export failed (${res.status})`);
  }

  return (await res.json()) as ArchLangExportResponse;
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
  const projectId = building.projectId || building.id;
  const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/archlang/impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      building,
      floorId,
      lockedRoomIds,
      targetRoomId,
    }),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.error?.message ?? `Room lock impact analysis failed (${res.status})`);
  }

  const data = (await res.json()) as ArchLangImpactResponse;
  return data.impact;
}
