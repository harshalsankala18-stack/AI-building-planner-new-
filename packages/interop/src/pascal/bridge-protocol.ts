import type { PascalScene } from './canonical-to-pascal';

export type PascalScenePayload = PascalScene;

export interface LoadSceneMessage {
  type: 'LOAD_SCENE';
  projectId: string;
  scene: PascalScenePayload;
  readOnly?: boolean;
}

export interface RequestSaveMessage {
  type: 'REQUEST_SAVE';
  requestId: string;
}

export interface ImportIfcBufferMessage {
  type: 'IMPORT_IFC_BUFFER';
  fileName: string;
  buffer: ArrayBuffer;
}

export interface SetViewModeMessage {
  type: 'SET_VIEW_MODE';
  mode: 'edit' | 'viewer';
}

export interface PingMessage {
  type: 'PING';
}

export interface SelectLevelMessage {
  type: 'SELECT_LEVEL';
  levelId: string;
  isolate?: boolean;
}

export interface SetLevelModeMessage {
  type: 'SET_LEVEL_MODE';
  mode: 'solo' | 'stacked' | 'exploded' | 'manual';
}

export interface SetWallModeMessage {
  type: 'SET_WALL_MODE';
  mode: 'up' | 'cutaway' | 'down' | 'translucent';
}

export interface SetWalkthroughModeMessage {
  type: 'SET_WALKTHROUGH_MODE';
  enabled: boolean;
}

export interface SetMeasureModeMessage {
  type: 'SET_MEASURE_MODE';
  enabled: boolean;
}

export interface UpdateNodeMessage {
  type: 'UPDATE_NODE';
  nodeId: string;
  patch: Record<string, any>;
}

export interface DeleteNodeMessage {
  type: 'DELETE_NODE';
  nodeId: string;
}

export type HostToStudioMessage =
  | LoadSceneMessage
  | RequestSaveMessage
  | ImportIfcBufferMessage
  | SetViewModeMessage
  | PingMessage
  | SelectLevelMessage
  | SetLevelModeMessage
  | SetWallModeMessage
  | SetWalkthroughModeMessage
  | SetMeasureModeMessage
  | UpdateNodeMessage
  | DeleteNodeMessage;

export interface StudioReadyMessage {
  type: 'STUDIO_READY';
  webgpuSupported: boolean;
}

export interface SceneLoadedMessage {
  type: 'SCENE_LOADED';
  nodeCount: number;
}

export interface SceneDirtyMessage {
  type: 'SCENE_DIRTY';
  dirty: boolean;
}

export interface SceneSavedPayloadMessage {
  type: 'SCENE_SAVED_PAYLOAD';
  requestId: string;
  scene: PascalScenePayload;
}

export interface IfcImportedMessage {
  type: 'IFC_IMPORTED';
  fileName: string;
  nodeCount: number;
}

export interface StudioErrorMessage {
  type: 'STUDIO_ERROR';
  code: string;
  message: string;
}

export interface SceneMutatedMessage {
  type: 'SCENE_MUTATED';
  scene: PascalScenePayload;
  syncOrigin?: string;
  nodeCount: number;
}

export interface NodeSelectedMessage {
  type: 'NODE_SELECTED';
  nodeId: string | null;
  nodeType?: string;
  nodeData?: any;
}

export type StudioToHostMessage =
  | StudioReadyMessage
  | SceneLoadedMessage
  | SceneDirtyMessage
  | SceneSavedPayloadMessage
  | IfcImportedMessage
  | StudioErrorMessage
  | SceneMutatedMessage
  | NodeSelectedMessage;

const HOST_MESSAGE_TYPES: ReadonlySet<string> = new Set<HostToStudioMessage['type']>([
  'LOAD_SCENE',
  'REQUEST_SAVE',
  'IMPORT_IFC_BUFFER',
  'SET_VIEW_MODE',
  'PING',
  'SELECT_LEVEL',
  'SET_LEVEL_MODE',
  'SET_WALL_MODE',
  'SET_WALKTHROUGH_MODE',
  'SET_MEASURE_MODE',
  'UPDATE_NODE',
  'DELETE_NODE',
]);

const STUDIO_MESSAGE_TYPES: ReadonlySet<string> = new Set<StudioToHostMessage['type']>([
  'STUDIO_READY',
  'SCENE_LOADED',
  'SCENE_DIRTY',
  'SCENE_SAVED_PAYLOAD',
  'IFC_IMPORTED',
  'STUDIO_ERROR',
  'SCENE_MUTATED',
  'NODE_SELECTED',
]);

export function isHostMessage(data: unknown): data is HostToStudioMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as { type?: unknown };
  return typeof msg.type === 'string' && HOST_MESSAGE_TYPES.has(msg.type);
}

export const isHostToStudioMessage = isHostMessage;

export function isStudioMessage(data: unknown): data is StudioToHostMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as { type?: unknown };
  return typeof msg.type === 'string' && STUDIO_MESSAGE_TYPES.has(msg.type);
}

export const isStudioToHostMessage = isStudioMessage;

export function isValidBridgeOrigin(origin: string, allowedOrigins?: string[]): boolean {
  if (allowedOrigins && allowedOrigins.length > 0) {
    return allowedOrigins.includes(origin);
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    if (origin === window.location.origin) return true;
  }
  try {
    const url = new URL(origin);
    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1'
    );
  } catch {
    return false;
  }
}
