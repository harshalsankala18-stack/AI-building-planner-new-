import React, { Component, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
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
import { createStarterScene } from './starter-scene';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack?: string;
}

class StudioErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown render error',
      errorStack: error.stack,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('StudioErrorBoundary caught error:', error, errorInfo);
    this.props.onError(error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 font-mono select-text">
          <div className="max-w-xl rounded-xl border border-rose-500/60 bg-rose-950/40 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Pascal 3D Studio Runtime Error
            </h2>
            <p className="mt-3 text-xs text-rose-100 font-semibold bg-rose-950/80 p-3 rounded border border-rose-800/60">
              {this.state.errorMessage}
            </p>
            {this.state.errorStack && (
              <pre className="mt-3 max-h-48 overflow-auto text-[10px] text-slate-300 bg-black/60 p-2.5 rounded">
                {this.state.errorStack}
              </pre>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="rounded bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition"
              >
                Retry Editor Render
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition"
              >
                Reload Window
              </button>
            </div>
          </div>
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
        // Fall back to window.location.origin
      }
    }
    window.parent.postMessage(message, targetOrigin);
  }
}

const pluginInitPromise = loadPlugin(builtinPlugin).catch((err: unknown) => {
  console.error('Failed to load Pascal builtinPlugin:', err);
  const message = err instanceof Error ? err.message : String(err);
  sendToHost({ type: 'STUDIO_ERROR', code: 'PLUGIN_INIT_FAILED', message });
  throw err;
});

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'edit' | 'viewer'>('edit');
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Buffer incoming scene if host pushes before Editor onLoad requests it
  const pendingSceneRef = useRef<any | null>(null);
  const onLoadResolverRef = useRef<((scene: any) => void) | null>(null);
  const isHydratingRef = useRef(false);
  const mutationDebounceTimerRef = useRef<any>(null);

  const isStandalone = typeof window !== 'undefined' && window.self === window.top;

  useEffect(() => {
    let mounted = true;

    pluginInitPromise
      .then(() => {
        if (!mounted) return;
        setReady(true);
        const webgpuSupported = typeof navigator !== 'undefined' && Boolean((navigator as any).gpu);
        sendToHost({ type: 'STUDIO_READY', webgpuSupported });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setInitError(err instanceof Error ? err.message : String(err));
      });

    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (!isValidBridgeOrigin(event.origin)) return;
      if (!isHostMessage(event.data)) return;

      const message = event.data as HostToStudioMessage;

      try {
        await pluginInitPromise;

        switch (message.type) {
          case 'PING': {
            const webgpuSupported = typeof navigator !== 'undefined' && Boolean((navigator as any).gpu);
            sendToHost({ type: 'STUDIO_READY', webgpuSupported });
            break;
          }

          case 'LOAD_SCENE': {
            const { nodes, rootNodeIds } = message.scene;
            pendingSceneRef.current = { nodes, rootNodeIds };
            isHydratingRef.current = true;

            if (onLoadResolverRef.current) {
              onLoadResolverRef.current({ nodes, rootNodeIds });
              onLoadResolverRef.current = null;
            } else {
              useScene.getState().setScene(nodes as any, rootNodeIds as any);
            }

            if (message.readOnly !== undefined) {
              useScene.getState().setReadOnly(message.readOnly);
            }
            sendToHost({
              type: 'SCENE_LOADED',
              nodeCount: Object.keys(nodes).length,
            });
            setTimeout(() => {
              isHydratingRef.current = false;
            }, 300);
            break;
          }

          case 'SELECT_LEVEL': {
            const levelId = message.levelId;
            if (levelId) {
              const state = useScene.getState();
              const node = state.nodes[levelId];
              if (node && (state as any).setSelectedNodeId) {
                (state as any).setSelectedNodeId(levelId);
              }
            }
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

    // Track scene dirty state and debounced mutations
    let prevDirty = false;
    const unsubscribeDirty = useScene.subscribe((state) => {
      const isDirty = (state.dirtyNodes?.size ?? 0) > 0;
      if (isDirty !== prevDirty) {
        prevDirty = isDirty;
        sendToHost({ type: 'SCENE_DIRTY', dirty: isDirty });
      }

      if (isHydratingRef.current) return;

      if (isDirty && state.nodes && Object.keys(state.nodes).length > 0) {
        if (mutationDebounceTimerRef.current) {
          clearTimeout(mutationDebounceTimerRef.current);
        }
        mutationDebounceTimerRef.current = setTimeout(() => {
          if (isHydratingRef.current) return;
          sendToHost({
            type: 'SCENE_MUTATED',
            scene: {
              nodes: state.nodes,
              rootNodeIds: state.rootNodeIds,
            },
            nodeCount: Object.keys(state.nodes).length,
            syncOrigin: 'pascal-studio',
          });
        }, 500);
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener('message', handleMessage);
      unsubscribeDirty();
      if (mutationDebounceTimerRef.current) {
        clearTimeout(mutationDebounceTimerRef.current);
      }
    };
  }, []);

  const handleStudioError = (error: Error) => {
    sendToHost({
      type: 'STUDIO_ERROR',
      code: 'RENDER_ERROR',
      message: error.message,
    });
  };

  /**
   * Required host prop for @pascal-app/editor
   * Resolves immediately with starter scene in standalone mode (:5174).
   * In iframe mode, awaits LOAD_SCENE from host without fake starter fallback.
   */
  const handleEditorLoad = async () => {
    if (isStandalone) {
      return createStarterScene() as any;
    }

    if (pendingSceneRef.current) {
      const scene = pendingSceneRef.current;
      pendingSceneRef.current = null;
      return scene;
    }

    sendToHost({ type: 'STUDIO_READY', webgpuSupported: typeof navigator !== 'undefined' && Boolean((navigator as any).gpu) });

    return new Promise((resolve) => {
      onLoadResolverRef.current = (scene) => {
        resolve(scene);
      };
    });
  };

  const handleEditorSave = async (scene: any) => {
    sendToHost({
      type: 'SCENE_DIRTY',
      dirty: false,
    });
  };

  if (initError) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100 font-mono">
        <div className="max-w-md rounded-xl border border-rose-500/60 bg-rose-950/40 p-6 shadow-xl">
          <h2 className="text-base font-bold text-rose-300">Pascal Plugin Initialization Failed</h2>
          <p className="mt-2 text-xs text-rose-200">{initError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-slate-950">
      <StudioErrorBoundary onError={handleStudioError}>
        {ready ? (
          viewMode === 'viewer' ? (
            <Viewer />
          ) : (
            <Editor
              onLoad={handleEditorLoad}
              onSave={handleEditorSave}
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Initializing Pascal 3D Studio...</span>
            </div>
          </div>
        )}
      </StudioErrorBoundary>
    </div>
  );
};

export default App;
