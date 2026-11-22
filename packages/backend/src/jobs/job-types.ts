/**
 * Strongly typed job payload and result definitions for Linux and Windows queues.
 */

export type QueueName = 'ai-and-light-exports' | 'windows-native-cad';

export interface BaseJobPayload {
  projectId: string;
  userId?: string;
  requestedAt?: string;
}

// ─── Linux Queue: ai-and-light-exports ────────────────────────────────────────

export interface ArchLangExportJobPayload extends BaseJobPayload {
  floorId: string;
  format: 'svg' | 'dxf' | 'pdf' | 'arch';
  autoFurnish?: boolean;
  circulationOverlay?: boolean;
  showDimensions?: boolean;
  lockedRoomIds?: string[];
}

export interface AIEdit2DJobPayload extends BaseJobPayload {
  floorId?: string;
  prompt: string;
  currentDsl?: string;
  lockedRoomIds?: string[];
}

export interface AIEdit3DJobPayload extends BaseJobPayload {
  prompt: string;
  scene?: Record<string, unknown>;
}

// ─── Windows Queue: windows-native-cad ────────────────────────────────────────

export interface AutocadDwgExportJobPayload extends BaseJobPayload {
  floorId?: string;
  cadStandard?: 'A' | 'B';
  nativeCadAudit?: boolean;
  dxfSourceKey?: string;
}

export interface EtabsAnalysisJobPayload extends BaseJobPayload {
  analysisType: 'gravity_linear' | 'modal_seismic' | 'wind_spectrum';
  gridDimensions?: { widthMm: number; depthMm: number; heightMm: number };
  materialGrade?: string;
}

export interface BlenderRenderJobPayload extends BaseJobPayload {
  sceneKey: string;
  resolution?: [number, number];
  renderEngine?: 'CYCLES' | 'BLENDER_EEVEE';
  samples?: number;
}

export type JobPayloadMap = {
  archlang_export: ArchLangExportJobPayload;
  ai_edit_2d: AIEdit2DJobPayload;
  ai_edit_3d: AIEdit3DJobPayload;
  autocad_dwg_export: AutocadDwgExportJobPayload;
  etabs_native_analysis: EtabsAnalysisJobPayload;
  blender_procedural_render: BlenderRenderJobPayload;
};

export type KnownJobType = keyof JobPayloadMap;

export function resolveQueueForJobType(jobType: string): QueueName {
  if (['autocad_dwg_export', 'etabs_native_analysis', 'blender_procedural_render'].includes(jobType)) {
    return 'windows-native-cad';
  }
  return 'ai-and-light-exports';
}
