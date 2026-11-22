import React, { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { loadPlugin, useScene } from '@pascal-app/core';
import { builtinPlugin } from '@pascal-app/nodes';
import { Editor } from '@pascal-app/editor';
import { Viewer } from '@pascal-app/viewer';
import { convertIfcToPascal } from '@pascal-app/ifc-converter';
import {
  isHostMessage,
  isValidBridgeOrigin,
  type HostToStudioMessage,
  type PascalScenePayload,
  type StudioToHostMessage,
} from '@ai-floor-planner/interop/bridge';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class StudioErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('StudioErrorBoundary caught error:', error, errorInfo);
    this.props.onError(error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#f87171', padding: '24px', fontFamily: 'sans-serif' }}>
          <h3>Pascal 3D Studio Error</h3>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function sendToHost(message: StudioToHostMessage): void {
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    let targetOrigin = window.location.origin;
    if (document.referrer) {
      try {
        const refOrigin = new URL(document.referrer).origin;
        if (isValidBridgeOrigin(refOrigin)) {
          targetOrigin = refOrigin;
        }
      } catch {
        // fall back to window.location.origin
      }
    }
    window.parent.postMessage(message, targetOrigin);
  }
}

const pluginInitPromise = loadPlugin(builtinPlugin).catch((err: unknown) => {
  console.error('Failed to load Pascal builtinPlugin:', err);
  const message = err instanceof Error ? err.message : String(err);
  sendToHost({ type: 'STUDIO_ERROR', code: 'PLUGIN_INIT_FAILED', message });
});

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'edit' | 'viewer'>('edit');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void pluginInitPromise.then(() => {
      if (!mounted) return;
      setReady(true);
      const webgpuSupported = typeof navigator !== 'undefined' && Boolean((navigator as any).gpu);
      sendToHost({ type: 'STUDIO_READY', webgpuSupported });
    });

    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (!isValidBridgeOrigin(event.origin)) return;
      if (!isHostMessage(event.data)) return;

      const message = event.data as HostToStudioMessage;

      try {
        await pluginInitPromise;

        switch (message.type) {
          case 'LOAD_SCENE': {
            const { nodes, rootNodeIds } = message.scene;
            useScene.getState().setScene(nodes as any, rootNodeIds as any);
            if (message.readOnly !== undefined) {
              useScene.getState().setReadOnly(message.readOnly);
            }
            sendToHost({
              type: 'SCENE_LOADED',
              nodeCount: Object.keys(nodes).length,
            });
            break;
          }

          case 'REQUEST_SAVE': {
            const state = useScene.getState();
            const payload: PascalScenePayload = {
              nodes: state.nodes,
              rootNodeIds: state.rootNodeIds,
            };
            sendToHost({
              type: 'SCENE_SAVED_PAYLOAD',
              requestId: message.requestId,
              scene: payload,
            });
            break;
          }

          case 'IMPORT_IFC_BUFFER': {
            const uint8 = new Uint8Array(message.buffer);
            const converted = await convertIfcToPascal(uint8);
            useScene.getState().setScene(converted.nodes, converted.rootNodeIds);
            sendToHost({
              type: 'IFC_IMPORTED',
              fileName: message.fileName,
              nodeCount: Object.keys(converted.nodes).length,
            });
            break;
          }

          case 'SET_VIEW_MODE': {
            setViewMode(message.mode);
            break;
          }
        }
      } catch (err: unknown) {
        console.error('Error processing host message:', err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        sendToHost({
          type: 'STUDIO_ERROR',
          code: 'MESSAGE_HANDLING_ERROR',
          message: errorMsg,
        });
      }
    };

    window.addEventListener('message', handleMessage);

    // Track scene dirty state
    let prevDirty = false;
    const unsubscribeDirty = useScene.subscribe((state) => {
      const isDirty = (state.dirtyNodes?.size ?? 0) > 0;
      if (isDirty !== prevDirty) {
        prevDirty = isDirty;
        sendToHost({ type: 'SCENE_DIRTY', dirty: isDirty });
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener('message', handleMessage);
      unsubscribeDirty();
    };
  }, []);

  const handleStudioError = (error: Error) => {
    sendToHost({
      type: 'STUDIO_ERROR',
      code: 'RENDER_ERROR',
      message: error.message,
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <StudioErrorBoundary onError={handleStudioError}>
        {ready ? (
          viewMode === 'viewer' ? (
            <Viewer />
          ) : (
            <Editor />
          )
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontFamily: 'sans-serif',
              fontSize: '14px',
            }}
          >
            Initializing Pascal 3D Studio...
          </div>
        )}
      </StudioErrorBoundary>
    </div>
  );
};

export default App;
