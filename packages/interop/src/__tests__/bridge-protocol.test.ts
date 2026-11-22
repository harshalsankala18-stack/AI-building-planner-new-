import { describe, expect, it } from 'vitest';
import {
  isHostMessage,
  isHostToStudioMessage,
  isStudioMessage,
  isStudioToHostMessage,
  isValidBridgeOrigin,
  type HostToStudioMessage,
  type StudioToHostMessage,
} from '../pascal/bridge-protocol';

describe('bridge-protocol', () => {
  it('correctly validates HostToStudio messages', () => {
    const validLoad: HostToStudioMessage = {
      type: 'LOAD_SCENE',
      projectId: 'proj-123',
      scene: { nodes: {}, rootNodeIds: [] },
      readOnly: false,
    };
    const validSave: HostToStudioMessage = {
      type: 'REQUEST_SAVE',
      requestId: 'req-1',
    };
    const validImport: HostToStudioMessage = {
      type: 'IMPORT_IFC_BUFFER',
      fileName: 'model.ifc',
      buffer: new ArrayBuffer(8),
    };
    const validMode: HostToStudioMessage = {
      type: 'SET_VIEW_MODE',
      mode: 'edit',
    };

    expect(isHostMessage(validLoad)).toBe(true);
    expect(isHostToStudioMessage(validSave)).toBe(true);
    expect(isHostMessage(validImport)).toBe(true);
    expect(isHostMessage(validMode)).toBe(true);

    expect(isHostMessage(null)).toBe(false);
    expect(isHostMessage(undefined)).toBe(false);
    expect(isHostMessage({})).toBe(false);
    expect(isHostMessage({ type: 'UNKNOWN_MSG' })).toBe(false);
    expect(isHostMessage({ type: 'STUDIO_READY' })).toBe(false);
  });

  it('correctly validates StudioToHost messages', () => {
    const validReady: StudioToHostMessage = {
      type: 'STUDIO_READY',
      webgpuSupported: true,
    };
    const validLoaded: StudioToHostMessage = {
      type: 'SCENE_LOADED',
      nodeCount: 42,
    };
    const validDirty: StudioToHostMessage = {
      type: 'SCENE_DIRTY',
      dirty: true,
    };
    const validSaved: StudioToHostMessage = {
      type: 'SCENE_SAVED_PAYLOAD',
      requestId: 'req-1',
      scene: { nodes: {}, rootNodeIds: [] },
    };
    const validImported: StudioToHostMessage = {
      type: 'IFC_IMPORTED',
      fileName: 'test.ifc',
      nodeCount: 15,
    };
    const validError: StudioToHostMessage = {
      type: 'STUDIO_ERROR',
      code: 'LOAD_FAILED',
      message: 'Failed to parse',
    };

    expect(isStudioMessage(validReady)).toBe(true);
    expect(isStudioToHostMessage(validLoaded)).toBe(true);
    expect(isStudioMessage(validDirty)).toBe(true);
    expect(isStudioMessage(validSaved)).toBe(true);
    expect(isStudioMessage(validImported)).toBe(true);
    expect(isStudioMessage(validError)).toBe(true);

    expect(isStudioMessage(null)).toBe(false);
    expect(isStudioMessage('string')).toBe(false);
    expect(isStudioMessage({ type: 'LOAD_SCENE' })).toBe(false);
  });

  it('validates bridge origins properly', () => {
    expect(isValidBridgeOrigin('http://localhost:3000')).toBe(true);
    expect(isValidBridgeOrigin('http://localhost:5174')).toBe(true);
    expect(isValidBridgeOrigin('http://127.0.0.1:4200')).toBe(true);
    expect(isValidBridgeOrigin('not-a-valid-url')).toBe(false);

    expect(isValidBridgeOrigin('https://custom-domain.com', ['https://custom-domain.com'])).toBe(true);
    expect(isValidBridgeOrigin('https://malicious.com', ['https://custom-domain.com'])).toBe(false);
  });
});
