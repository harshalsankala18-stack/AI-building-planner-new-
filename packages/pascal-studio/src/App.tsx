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
  const fullSceneNodesRef = useRef<Record<string, any>>({});
  const activeLevelIdRef = useRef<string | null>(null);
  const currentLevelModeRef = useRef<'solo' | 'stacked' | 'exploded'>('solo');
  const onLoadResolverRef = useRef<((scene: any) => void) | null>(null);
  const isHydratingRef = useRef(false);
  const mutationDebounceTimerRef = useRef<any>(null);
  const userEditActiveRef = useRef(false);
  const lastSyncedHashRef = useRef<string>('');

  const mergeLiveEditsIntoFullScene = (liveNodes: Record<string, any>) => {
    const full = fullSceneNodesRef.current;
    for (const [nid, liveNode] of Object.entries(liveNodes)) {
      if (!liveNode || (liveNode as any)?.type === 'spawn') continue;
      const prevFull = full[nid];
      // Preserve unmounted inactive children on LevelNode / CeilingNode when merging from a culled view
      if (
        prevFull &&
        ((liveNode as any).type === 'level' || (liveNode as any).type === 'ceiling') &&
        Array.isArray(prevFull.children) &&
        Array.isArray((liveNode as any).children)
      ) {
        const mergedChildSet = new Set<string>(prevFull.children);
        for (const cid of (liveNode as any).children) {
          mergedChildSet.add(cid);
        }
        full[nid] = {
          ...structuredClone(liveNode),
          children: Array.from(mergedChildSet),
        };
      } else {
        full[nid] = structuredClone(liveNode);
      }
    }
  };

  /**
   * Performance Culling for large multi-story projects (Stage F):
   * - In `solo` mode on multi-story buildings: mounts ONLY the active level's full nodes
   *   plus lightweight `LevelNode` stubs (`children: []`) for inactive floors so Pascal skips
   *   building 400+ hidden wall CSG openings & off-floor items until the user switches floors.
   * - In `stacked`/`exploded` mode with > 45 total items: mounts the full structural shell across
   *   all levels while mounting heavy `item` meshes ONLY for `activeLevelId`.
   * Full nodes stay preserved inside `fullSceneNodesRef` so saving & switching floors loses zero data.
   */
  const buildActiveCulledNodes = (
    sourceNodes: Record<string, any>,
    preferredLevelId: string | null,
    mode: 'solo' | 'stacked' | 'exploded',
  ): { nodes: Record<string, any>; activeLevelId: string | null } => {
    const levels = Object.values(sourceNodes)
      .filter((n: any) => n && n.type === 'level')
      .sort((a: any, b: any) => (a.level ?? 0) - (b.level ?? 0));
    // Default to 1st floor (index 1) or lowest residential floor if floor 0 is empty stilt, else level 0
    const resolvedLevelId =
      (preferredLevelId && sourceNodes[preferredLevelId] ? preferredLevelId : null) ??
      (levels[0]?.id ?? null);

    let totalItems = 0;
    for (const n of Object.values(sourceNodes)) {
      if ((n as any)?.type === 'item') totalItems++;
    }

    const outNodes: Record<string, any> = {};
    for (const [id, raw] of Object.entries(sourceNodes)) {
      if (!raw || typeof raw !== 'object') continue;
      outNodes[id] = {
        ...raw,
        ...(Array.isArray((raw as any).children) ? { children: [...(raw as any).children] } : {}),
      };
    }

    if (levels.length > 1 && resolvedLevelId) {
      const inactiveLevelIds = new Set(levels.filter((l: any) => l.id !== resolvedLevelId).map((l: any) => l.id));

      // Map every node to its ancestor levelId cleanly
      const resolveOwnerLevel = (nodeId: string): string | null => {
        let cur = outNodes[nodeId];
        let depth = 0;
        while (cur && depth < 6) {
          if (cur.type === 'level') return cur.id;
          if (!cur.parentId) return null;
          cur = outNodes[cur.parentId];
          depth++;
        }
        return null;
      };

      const removedIds = new Set<string>();
      for (const [id, n] of Object.entries(outNodes)) {
        if (!n || n.type === 'site' || n.type === 'building' || n.type === 'level') continue;
        const ownerLvl = resolveOwnerLevel(id);
        if (!ownerLvl || !inactiveLevelIds.has(ownerLvl)) continue;

        if (mode === 'solo') {
          // Prune ALL inactive floor children in Solo mode so load mounts 1 floor (~250 nodes instead of 1,350+)
          removedIds.add(id);
        } else if (totalItems > 45) {
          // In All Floors / Exploded mode on multi-story towers, cull inactive floor items AND hidden
          // internal partition walls (and doors on internal partitions) while keeping 100% of exterior facade walls,
          // exterior windows/doors, slabs, columns, balconies, and stairs so 5-story exteriors render smoothly!
          if (n.type === 'item') {
            removedIds.add(id);
          } else if (
            levels.length > 2 &&
            mode === 'stacked' &&
            n.type === 'wall' &&
            n.metadata?.wallUse !== 'EXTERNAL' &&
            !n.metadata?.isBalconyRailing
          ) {
            removedIds.add(id);
            if (Array.isArray(n.children)) {
              for (const childId of n.children) removedIds.add(childId);
            }
          }
        }
      }

      for (const id of removedIds) {
        delete outNodes[id];
      }
      for (const n of Object.values(outNodes)) {
        if (Array.isArray((n as any).children)) {
          (n as any).children = (n as any).children.filter((cid: string) => !removedIds.has(cid));
        }
      }
    }

    return { nodes: outNodes, activeLevelId: resolvedLevelId };
  };

  const isStandalone = typeof window !== 'undefined' && window.self === window.top;

  useEffect(() => {
    let mounted = true;
    (window as any).__PASCAL_USE_SCENE__ = useScene;
    (window as any).__PASCAL_USE_VIEWER__ = useViewer;

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
            fullSceneNodesRef.current = structuredClone(nodes);
            const selectedBefore = useViewer.getState().selection?.levelId ?? activeLevelIdRef.current;
            const culled = buildActiveCulledNodes(
              fullSceneNodesRef.current,
              selectedBefore,
              currentLevelModeRef.current,
            );
            activeLevelIdRef.current = culled.activeLevelId;

            // Auto-hide ceilings in cutaway mode BEFORE committing scene
            for (const n of Object.values(culled.nodes)) {
              if ((n as any).type === 'ceiling') {
                (n as any).visible = false;
              }
            }

            pendingSceneRef.current = { nodes: culled.nodes, rootNodeIds };
            isHydratingRef.current = true;
            userEditActiveRef.current = false;
            lastSyncedHashRef.current = computeSceneContentHash(culled.nodes);

            if (onLoadResolverRef.current) {
              onLoadResolverRef.current({ nodes: culled.nodes, rootNodeIds });
              onLoadResolverRef.current = null;
            } else {
              useScene.getState().setScene(culled.nodes as any, rootNodeIds as any);
            }

            if (message.readOnly !== undefined) {
              useScene.getState().setReadOnly(message.readOnly);
            }

            // Stage F: Bright architectural daylight + default cutaway view + active level isolation
            try {
              useViewer.getState().setProjectPresentation({
                lighting: {
                  ambient: { color: '#ffffff', intensity: 0.85 },
                  hemi: { sky: '#ffffff', ground: '#e0e0e0', intensity: 0.75 },
                },
                exposure: 1.15,
              } as any);
              useViewer.setState({ hideLevelsAboveSelection: false } as any);
              useViewer.getState().setWallMode('cutaway');
              if (culled.activeLevelId) {
                useViewer.getState().setSelection({ levelId: culled.activeLevelId });
                useViewer.getState().setLevelMode(currentLevelModeRef.current);
              }
            } catch (e) {
              console.warn('Could not initialize bright viewer presentation:', e);
            }

            sendToHost({
              type: 'SCENE_LOADED',
              nodeCount: Object.keys(culled.nodes).length,
            });
            setTimeout(() => {
              isHydratingRef.current = false;
              lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
              userEditActiveRef.current = false;
            }, 350);
            break;
          }

          case 'SELECT_LEVEL': {
            const levelId = message.levelId;
            if (levelId) {
              activeLevelIdRef.current = levelId;
              const nextMode = message.isolate !== false ? 'solo' : currentLevelModeRef.current;
              currentLevelModeRef.current = nextMode;

              // Merge any live edits on currently mounted nodes back into fullSceneNodesRef before swapping floors
              mergeLiveEditsIntoFullScene(useScene.getState().nodes);

              isHydratingRef.current = true;
              const culled = buildActiveCulledNodes(fullSceneNodesRef.current, levelId, nextMode);
              const wallMode = useViewer.getState().wallMode;
              const hideCeilings = wallMode === 'cutaway' || wallMode === 'down';
              for (const n of Object.values(culled.nodes)) {
                if ((n as any).type === 'ceiling') {
                  (n as any).visible = !hideCeilings;
                }
              }

              const state = useScene.getState();
              state.setScene(culled.nodes as any, state.rootNodeIds as any);
              if (culled.nodes[levelId] && (state as any).setSelectedNodeId) {
                (state as any).setSelectedNodeId(levelId);
              }
              try {
                useViewer.setState({ hideLevelsAboveSelection: message.isolate !== false } as any);
                useViewer.getState().setSelection({ levelId });
                if (message.isolate !== false) {
                  useViewer.getState().setLevelMode('solo');
                }
              } catch (e) {
                console.warn('Error setting level selection on viewer:', e);
              }
              setTimeout(() => {
                isHydratingRef.current = false;
                lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
                userEditActiveRef.current = false;
              }, 250);
            }
            break;
          }

          case 'SET_LEVEL_MODE': {
            try {
              const mode = message.mode;
              currentLevelModeRef.current = mode;
              mergeLiveEditsIntoFullScene(useScene.getState().nodes);
              isHydratingRef.current = true;
              const culled = buildActiveCulledNodes(
                fullSceneNodesRef.current,
                activeLevelIdRef.current ?? (useViewer.getState().selection?.levelId ?? null),
                mode,
              );
              const wallMode = useViewer.getState().wallMode;
              const hideCeilings = wallMode === 'cutaway' || wallMode === 'down';
              for (const n of Object.values(culled.nodes)) {
                if ((n as any).type === 'ceiling') {
                  (n as any).visible = !hideCeilings;
                }
              }
              useScene.getState().setScene(culled.nodes as any, useScene.getState().rootNodeIds as any);
              // Ensure All Floors / Exploded NEVER leaves upper levels hidden as shadow-only above active floor
              useViewer.setState({
                hideLevelsAboveSelection: mode === 'solo',
              } as any);
              useViewer.getState().setLevelMode(mode);
              setTimeout(() => {
                isHydratingRef.current = false;
                lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
                userEditActiveRef.current = false;
              }, 250);
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
                isHydratingRef.current = true;
                const state = useScene.getState();
                const workingNodes: Record<string, any> = { ...state.nodes };
                const activeLvlId =
                  activeLevelIdRef.current ??
                  useViewer.getState().selection?.levelId ??
                  (Object.values(workingNodes).find((n: any) => n.type === 'level') as any)?.id;

                const lvlNode = activeLvlId ? workingNodes[activeLvlId] : null;
                const baseElevM = Number(lvlNode?.baseElevation ?? 0);

                // Find active floor's Living Room zone (fallback to largest non-bath room on active level)
                const levelZones = Object.values(workingNodes).filter(
                  (n: any) => n && n.type === 'zone' && (!activeLvlId || n.parentId === activeLvlId),
                );
                const livingZone =
                  levelZones.find((z: any) => /living|drawing|hall/i.test(z.name || '')) ??
                  levelZones
                    .filter((z: any) => !/bath|wc|toilet|shaft|balcony|parking/i.test(z.name || ''))
                    .sort((a: any, b: any) => {
                      const polyArea = (pts: [number, number][]) => {
                        if (!Array.isArray(pts) || pts.length < 3) return 0;
                        let s = 0;
                        for (let i = 0; i < pts.length; i++) {
                          const p1 = pts[i]!;
                          const p2 = pts[(i + 1) % pts.length]!;
                          s += p1[0] * p2[1] - p2[0] * p1[1];
                        }
                        return Math.abs(s) / 2;
                      };
                      return polyArea(b.polygon) - polyArea(a.polygon);
                    })[0] ??
                  levelZones[0];

                let spawnX = 4;
                let spawnZ = 4;
                let yawRad = 0;
                let lookAtX = 6;
                let lookAtZ = 4;

                if (livingZone && Array.isArray(livingZone.polygon) && livingZone.polygon.length >= 3) {
                  let sumX = 0;
                  let sumZ = 0;
                  let zMinX = Infinity, zMaxX = -Infinity, zMinZ = Infinity, zMaxZ = -Infinity;
                  for (const pt of livingZone.polygon) {
                    const px = Number(pt[0] ?? 0);
                    const pz = Number(pt[1] ?? 0);
                    sumX += px;
                    sumZ += pz;
                    zMinX = Math.min(zMinX, px);
                    zMaxX = Math.max(zMaxX, px);
                    zMinZ = Math.min(zMinZ, pz);
                    zMaxZ = Math.max(zMaxZ, pz);
                  }
                  const centerX = sumX / livingZone.polygon.length;
                  const centerZ = sumZ / livingZone.polygon.length;
                  spawnX = centerX;
                  spawnZ = centerZ;

                  const insideLiving = (px: number, pz: number) =>
                    px > zMinX + 0.45 && px < zMaxX - 0.45 && pz > zMinZ + 0.45 && pz < zMaxZ - 0.45;

                  // Aim eye view directly toward Living Room TV Feature Wall / Sofa strictly inside Living Room bounds
                  const livingRoomId = livingZone.metadata?.canonicalRoomId;
                  const roomItems = Object.values(workingNodes).filter(
                    (n: any) =>
                      n &&
                      n.type === 'item' &&
                      (!activeLvlId || n.parentId === activeLvlId) &&
                      (livingRoomId ? n.metadata?.canonicalRoomId === livingRoomId : insideLiving(n.position?.[0] ?? -999, n.position?.[2] ?? -999)),
                  ) as any[];
                  const tvItem = roomItems.find((n: any) => n.asset?.id === 'tv_console');
                  const sofaItem = roomItems.find((n: any) => n.asset?.id === 'sofa_3seater');

                  if (tvItem && sofaItem && Array.isArray(tvItem.position) && Array.isArray(sofaItem.position)) {
                    const tx = Number(tvItem.position[0]);
                    const tz = Number(tvItem.position[2]);
                    const sx = Number(sofaItem.position[0]);
                    const sz = Number(sofaItem.position[2]);
                    // Stand on the Sofa side looking across Coffee Table straight at the front of the TV Feature Wall
                    const candX = sx * 0.72 + tx * 0.28;
                    const candZ = sz * 0.72 + tz * 0.28;
                    if (insideLiving(candX, candZ)) {
                      spawnX = candX;
                      spawnZ = candZ;
                    }
                    lookAtX = tx;
                    lookAtZ = tz;
                    yawRad = Math.atan2(-(lookAtX - spawnX), -(lookAtZ - spawnZ));
                  } else if (tvItem && Array.isArray(tvItem.position)) {
                    const tx = Number(tvItem.position[0]);
                    const tz = Number(tvItem.position[2]);
                    const dx = centerX - tx;
                    const dz = centerZ - tz;
                    const dLen = Math.hypot(dx, dz) || 1;
                    const step = Math.min(2.2, Math.max(1.2, dLen * 0.9));
                    const candX = tx + (dx / dLen) * step;
                    const candZ = tz + (dz / dLen) * step;
                    if (insideLiving(candX, candZ)) {
                      spawnX = candX;
                      spawnZ = candZ;
                    }
                    lookAtX = tx;
                    lookAtZ = tz;
                    yawRad = Math.atan2(-(lookAtX - spawnX), -(lookAtZ - spawnZ));
                  } else if (sofaItem && Array.isArray(sofaItem.position)) {
                    lookAtX = Number(sofaItem.position[0] ?? spawnX + 2);
                    lookAtZ = Number(sofaItem.position[2] ?? spawnZ);
                    yawRad = Math.atan2(-(lookAtX - spawnX), -(lookAtZ - spawnZ));
                  } else {
                    lookAtX = spawnX + 2.0;
                    lookAtZ = spawnZ;
                    yawRad = -Math.PI / 2;
                  }
                }

                // Inject native Pascal SpawnNode on active level so banner never renders and
                // build-collider-world spawns strictly inside the Living Room at eye height (1.65m)
                const spawnId = 'spawn_living_room';
                if (activeLvlId && workingNodes[activeLvlId]) {
                  workingNodes[spawnId] = {
                    id: spawnId,
                    object: 'node',
                    type: 'spawn',
                    name: 'Living Room Walkthrough Spawn',
                    parentId: activeLvlId,
                    visible: true,
                    position: [spawnX, 0, spawnZ],
                    rotation: yawRad,
                    metadata: { autoGenerated: true },
                    children: [],
                  };
                  const lvlChildren: string[] = Array.isArray(workingNodes[activeLvlId].children)
                    ? [...workingNodes[activeLvlId].children]
                    : [];
                  if (!lvlChildren.includes(spawnId)) {
                    lvlChildren.push(spawnId);
                    workingNodes[activeLvlId] = {
                      ...workingNodes[activeLvlId],
                      children: lvlChildren,
                    };
                  }
                }

                // Show full-height walls & ceilings for realistic first-person interior view
                for (const n of Object.values(workingNodes)) {
                  if ((n as any)?.type === 'ceiling') {
                    (n as any).visible = true;
                  }
                }
                useScene.setState({ nodes: workingNodes });

                const applyLivingAim = () => {
                  const threeCam = (window as any).__THREE_CAMERA__;
                  if (threeCam && threeCam.position) {
                    threeCam.position.set(spawnX, baseElevM + 1.55, spawnZ);
                    if (typeof threeCam.lookAt === 'function') {
                      threeCam.lookAt(lookAtX, baseElevM + 1.15, lookAtZ);
                    }
                    if (typeof threeCam.updateProjectionMatrix === 'function') {
                      threeCam.updateProjectionMatrix();
                    }
                  }
                };
                applyLivingAim();

                useViewer.getState().setWallMode('up');
                useViewer.getState().setWalkthroughMovement('walk');
                useViewer.getState().setWalkthroughInputMode('desktop');
                useViewer.getState().setWalkthroughMode(true);
                try {
                  useEditor.getState().setFirstPersonMode(true);
                } catch {
                  // ignore
                }
                setTimeout(applyLivingAim, 120);
                setTimeout(applyLivingAim, 350);
                setTimeout(() => {
                  isHydratingRef.current = false;
                  lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
                }, 400);
              } else {
                isHydratingRef.current = true;
                useViewer.getState().setWalkthroughMode(false);
                try {
                  useEditor.getState().setFirstPersonMode(false);
                } catch {
                  // ignore
                }
                useViewer.setState({ hideLevelsAboveSelection: false } as any);
              useViewer.getState().setWallMode('cutaway');
                const state = useScene.getState();
                const nextNodes = { ...state.nodes };
                delete nextNodes['spawn_living_room'];
                for (const n of Object.values(nextNodes)) {
                  if ((n as any)?.type === 'ceiling') {
                    (n as any).visible = false;
                  }
                  if ((n as any)?.type === 'level' && Array.isArray((n as any).children)) {
                    (n as any).children = (n as any).children.filter((cid: string) => cid !== 'spawn_living_room');
                  }
                }
                useScene.setState({ nodes: nextNodes });
                setTimeout(() => {
                  isHydratingRef.current = false;
                  lastSyncedHashRef.current = computeSceneContentHash(useScene.getState().nodes);
                }, 200);
              }
            } catch (e) {
              console.warn('Error toggling walkthrough mode:', e);
              isHydratingRef.current = false;
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
            mergeLiveEditsIntoFullScene(state.nodes);
            const merged = fullSceneNodesRef.current;
            const payload: PascalScenePayload = {
              nodes: merged,
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
          mergeLiveEditsIntoFullScene(curState.nodes);
          const mergedNodes = fullSceneNodesRef.current;
          sendToHost({
            type: 'SCENE_MUTATED',
            scene: {
              nodes: mergedNodes,
              rootNodeIds: curState.rootNodeIds,
            },
            nodeCount: Object.keys(mergedNodes).length,
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
