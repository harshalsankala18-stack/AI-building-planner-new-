import React, { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { loadPlugin, useScene } from '@pascal-app/core';
import { builtinPlugin } from '@pascal-app/nodes';
import { Editor, useEditor } from '@pascal-app/editor';
import { Viewer, useViewer } from '@pascal-app/viewer';
import { convertIfcToPascal } from '@pascal-app/ifc-converter';
import {
  isHostMessage,
  isValidBridgeOrigin,
  type HostToStudioMessage,
  type PascalScenePayload,
  type StudioToHostMessage,
} from '@ai-floor-planner/interop/bridge';
import { createStarterScene } from './starter-scene';
import { ArchitecturalEnvironment } from './scene/ArchitecturalEnvironment';

/**
 * Fast deterministic hash of user-editable scene elements (items, walls, doors, windows, zones).
 * Ignores internal non-geometric state so unsolicited internal dirty flags never trigger mutations.
 */
function computeSceneContentHash(nodes: Record<string, any> | undefined): string {
  if (!nodes) return '';
  const entries: string[] = [];
  for (const [id, node] of Object.entries(nodes)) {
    if (!node || typeof node !== 'object') continue;
    const type = (node as any).type;
    if (type === 'item') {
      const pos = (node as any).position ?? [];
      const rot = (node as any).rotation ?? [];
      entries.push(`${id}:item:${pos.map((v: number) => Math.round(v * 100)).join(',')}:${rot.map((v: number) => Math.round(v * 100)).join(',')}`);
    } else if (type === 'wall') {
      const s = (node as any).start ?? [];
      const e = (node as any).end ?? [];
      const th = Math.round(((node as any).thickness ?? 0) * 100);
      entries.push(`${id}:wall:${s.map((v: number) => Math.round(v * 100)).join(',')}:${e.map((v: number) => Math.round(v * 100)).join(',')}:${th}`);
    } else if (type === 'door' || type === 'window') {
      const pos = (node as any).position ?? [];
      const wId = (node as any).wallId ?? '';
      const w = Math.round(((node as any).width ?? 0) * 100);
      entries.push(`${id}:${type}:${wId}:${pos.map((v: number) => Math.round(v * 100)).join(',')}:${w}`);
    } else if (type === 'zone') {
      const poly = (node as any).polygon ?? [];
      const pts = poly.map((pt: [number, number]) => `${Math.round(pt[0] * 100)},${Math.round(pt[1] * 100)}`).join(';');
      entries.push(`${id}:zone:${pts}`);
    }
  }
  entries.sort();
  return entries.join('|');
}

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
  const userEditActiveRef = useRef(false);
  const lastSyncedHashRef = useRef<string>('');

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
            userEditActiveRef.current = false;
            lastSyncedHashRef.current = computeSceneContentHash(nodes);

            if (onLoadResolverRef.current) {
              onLoadResolverRef.current({ nodes, rootNodeIds });
              onLoadResolverRef.current = null;
            } else {
              useScene.getState().setScene(nodes as any, rootNodeIds as any);
            }

            if (message.readOnly !== undefined) {
              useScene.getState().setReadOnly(message.readOnly);
            }

            // Stage C: Configure bright interior lighting and default cutaway view
            try {
              useViewer.getState().setProjectPresentation({
                lighting: {
                  ambient: { color: '#ffffff', intensity: 0.85 },
                  hemi: { sky: '#ffffff', ground: '#e0e0e0', intensity: 0.75 },
                },
                exposure: 1.15,
              } as any);
              useViewer.getState().setWallMode('cutaway');
              // Auto-hide ceilings in cutaway mode so interior is bright and clearly visible
              for (const n of Object.values(nodes)) {
                if ((n as any).type === 'ceiling') {
                  (n as any).visible = false;
                }
              }
            } catch (e) {
              console.warn('Could not initialize bright viewer presentation:', e);
            }

            sendToHost({
              type: 'SCENE_LOADED',
              nodeCount: Object.keys(nodes).length,
            });
            setTimeout(() => {
              isHydratingRef.current = false;
              lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
              userEditActiveRef.current = false;
            }, 500);
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
              try {
                useViewer.getState().setSelection({ levelId });
                if (message.isolate !== false) {
                  useViewer.getState().setLevelMode('solo');
                }
              } catch (e) {
                console.warn('Error setting level selection on viewer:', e);
              }
            }
            break;
          }

          case 'SET_LEVEL_MODE': {
            try {
              useViewer.getState().setLevelMode(message.mode);
            } catch (e) {
              console.warn('Error setting level mode:', e);
            }
            break;
          }

          case 'SET_WALL_MODE': {
            try {
              useViewer.getState().setWallMode(message.mode);
              const state = useScene.getState();
              const shouldHideCeilings = message.mode === 'cutaway' || message.mode === 'down';
              let modified = false;
              for (const n of Object.values(state.nodes)) {
                if (n.type === 'ceiling') {
                  (n as any).visible = !shouldHideCeilings;
                  modified = true;
                }
              }
              if (modified) {
                useScene.setState({ nodes: { ...state.nodes } });
              }
            } catch (e) {
              console.warn('Error setting wall mode:', e);
            }
            break;
          }

          case 'SET_WALKTHROUGH_MODE': {
            try {
              if (message.enabled) {
                useViewer.getState().setWallMode('up');
                const state = useScene.getState();
                for (const n of Object.values(state.nodes)) {
                  if (n.type === 'ceiling') {
                    (n as any).visible = true;
                  }
                }
                useScene.setState({ nodes: { ...state.nodes } });
                useViewer.getState().setWalkthroughMovement('walk');
                useViewer.getState().setWalkthroughInputMode('desktop');
                useViewer.getState().setWalkthroughMode(true);
                try {
                  useEditor.getState().setFirstPersonMode(true);
                } catch {
                  // ignore
                }
              } else {
                useViewer.getState().setWalkthroughMode(false);
                try {
                  useEditor.getState().setFirstPersonMode(false);
                } catch {
                  // ignore
                }
                useViewer.getState().setWallMode('cutaway');
              }
            } catch (e) {
              console.warn('Error toggling walkthrough mode:', e);
            }
            break;
          }

          case 'SET_MEASURE_MODE': {
            try {
              useViewer.getState().setShowMeasurements(message.enabled);
            } catch (e) {
              console.warn('Error setting measure mode:', e);
            }
            break;
          }

          case 'UPDATE_NODE': {
            const { nodeId, patch } = message;
            const state = useScene.getState();
            const node = state.nodes[nodeId];
            if (node) {
              userEditActiveRef.current = true;
              state.nodes[nodeId] = { ...node, ...patch } as any;
              state.dirtyNodes = new Set([...(state.dirtyNodes ?? []), nodeId]);
              useScene.setState({ nodes: { ...state.nodes }, dirtyNodes: state.dirtyNodes });
            }
            break;
          }

          case 'DELETE_NODE': {
            const { nodeId } = message;
            const state = useScene.getState();
            const node = state.nodes[nodeId];
            if (node) {
              userEditActiveRef.current = true;
              const newNodes = { ...state.nodes };
              delete newNodes[nodeId];
              if (node.parentId && newNodes[node.parentId]) {
                const parent = newNodes[node.parentId] as any;
                if (Array.isArray(parent.children)) {
                  parent.children = parent.children.filter((cid: string) => cid !== nodeId);
                }
              }
              useScene.setState({ nodes: newNodes, dirtyNodes: new Set([...(state.dirtyNodes ?? []), nodeId]) });
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

    // Track user active editing intent (pointer interaction or keydown on canvas)
    const onUserInteraction = () => {
      userEditActiveRef.current = true;
    };
    window.addEventListener('pointerdown', onUserInteraction, { capture: true });
    window.addEventListener('keydown', onUserInteraction, { capture: true });

    // Track scene dirty state and debounced mutations strictly gated on user intent
    let prevDirty = false;
    const unsubscribeDirty = useScene.subscribe((state) => {
      const isDirty = (state.dirtyNodes?.size ?? 0) > 0;
      if (isDirty !== prevDirty) {
        prevDirty = isDirty;
        sendToHost({ type: 'SCENE_DIRTY', dirty: isDirty });
      }

      if (isHydratingRef.current) return;
      if (!userEditActiveRef.current) return;

      const currentHash = computeSceneContentHash(state.nodes);
      if (currentHash === lastSyncedHashRef.current) return;

      if (isDirty && state.nodes && Object.keys(state.nodes).length > 0) {
        if (mutationDebounceTimerRef.current) {
          clearTimeout(mutationDebounceTimerRef.current);
        }
        mutationDebounceTimerRef.current = setTimeout(() => {
          if (isHydratingRef.current) return;
          if (!userEditActiveRef.current) return;

          const freshHash = computeSceneContentHash(useScene.getState().nodes);
          if (freshHash === lastSyncedHashRef.current) return;

          lastSyncedHashRef.current = freshHash;
          userEditActiveRef.current = false;

          const curState = useScene.getState();
          sendToHost({
            type: 'SCENE_MUTATED',
            scene: {
              nodes: curState.nodes,
              rootNodeIds: curState.rootNodeIds,
            },
            nodeCount: Object.keys(curState.nodes).length,
            syncOrigin: 'pascal-studio',
          });
        }, 500);
      }
    });

    // Track selection changes and notify host
    let prevSelectedId: string | null = null;
    const unsubscribeSelection = useViewer.subscribe((viewerState) => {
      const selIds = viewerState.selection?.selectedIds ?? [];
      const currentId = selIds[0] ?? null;
      if (currentId !== prevSelectedId) {
        prevSelectedId = currentId;
        if (currentId) {
          const node = useScene.getState().nodes[currentId];
          sendToHost({
            type: 'NODE_SELECTED',
            nodeId: currentId,
            nodeType: node?.type,
            nodeData: node,
          });
        } else {
          sendToHost({
            type: 'NODE_SELECTED',
            nodeId: null,
          });
        }
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('pointerdown', onUserInteraction, { capture: true });
      window.removeEventListener('keydown', onUserInteraction, { capture: true });
      unsubscribeDirty();
      unsubscribeSelection();
      if (mutationDebounceTimerRef.current) {
        clearTimeout(mutationDebounceTimerRef.current);
      }
    };
  }, []);

  const memoizedViewerSceneSlot = useMemo(() => <ArchitecturalEnvironment />, []);

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
              viewerSceneSlot={memoizedViewerSceneSlot}
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
