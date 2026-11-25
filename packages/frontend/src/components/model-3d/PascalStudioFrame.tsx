import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Building, Door, Window, CanonicalFurnitureItem } from '@ai-floor-planner/core';
import { SwingDirection } from '@ai-floor-planner/core';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileUp,
  Footprints,
  Loader2,
  RotateCcw,
  Ruler,
  Save,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import { Ai3DEditDrawer } from './Ai3DEditDrawer';
import { ElementsCatalogDrawer, type CatalogPlacementItem } from './ElementsCatalogDrawer';
import {
  ElementPropertiesInspector,
  type SelectedNodeInfo,
} from './ElementPropertiesInspector';
import {
  isStudioMessage,
  isValidBridgeOrigin,
  type HostToStudioMessage,
  type StudioToHostMessage,
} from '@ai-floor-planner/interop/bridge';

export interface PascalStudioFrameProps {
  readonly projectId: string;
  readonly building?: Building;
  readonly onBuildingUpdate?: (building: Building) => void;
  readonly onFallbackToStandard?: () => void;
  readonly reloadKey?: number;
  readonly activeFloorId?: string;
  readonly paused?: boolean;
}

export const PascalStudioFrame: React.FC<PascalStudioFrameProps> = ({
  projectId,
  building,
  onBuildingUpdate,
  onFallbackToStandard,
  reloadKey,
  activeFloorId,
  paused = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasWebGpu, setHasWebGpu] = useState<boolean>(true);
  const [studioReady, setStudioReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [levelMode, setLevelMode] = useState<'solo' | 'stacked' | 'exploded'>('solo');
  const [wallMode, setWallMode] = useState<'cutaway' | 'up'>('cutaway');
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [measureActive, setMeasureActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningsExpanded, setWarningsExpanded] = useState(false);

  // Phase 4: 3D AI editing state
  const [aiEditing3d, setAiEditing3d] = useState(false);
  const [, setAppliedOpsCount] = useState<number | null>(null);

  const buildingRef = useRef(building);
  useEffect(() => {
    buildingRef.current = building;
  }, [building]);

  const activeFloorIdRef = useRef(activeFloorId);
  useEffect(() => {
    activeFloorIdRef.current = activeFloorId;
  }, [activeFloorId]);

  const levelModeRef = useRef(levelMode);
  useEffect(() => {
    levelModeRef.current = levelMode;
  }, [levelMode]);

  const wallModeRef = useRef(wallMode);
  useEffect(() => {
    wallModeRef.current = wallMode;
  }, [wallMode]);

  const isSyncingFrom3dRef = useRef(false);
  const isLoadingSceneRef = useRef(false);
  const lastLoadedSceneKeyRef = useRef<string>('');

  // Check WebGPU availability at mount
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const gpu = Boolean((navigator as any).gpu);
      setHasWebGpu(gpu);
    }
  }, []);

  const postToStudio = useCallback((message: HostToStudioMessage) => {
    if (iframeRef.current?.contentWindow) {
      let targetOrigin = window.location.origin;
      try {
        if (iframeRef.current.src) {
          targetOrigin = new URL(iframeRef.current.src, window.location.href).origin;
        }
      } catch {
        // fallback
      }
      iframeRef.current.contentWindow.postMessage(message, targetOrigin);
    }
  }, []);

  const loadSceneFromBackend = useCallback(async (force = false) => {
    if (isLoadingSceneRef.current) return;
    if (isSyncingFrom3dRef.current && !force) return;

    const currentBuilding = buildingRef.current;
    const revisionKey = `${currentBuilding?.id ?? projectId}_${currentBuilding?.version ?? 0}_${currentBuilding?.updatedAt ?? ''}`;
    if (!force && lastLoadedSceneKeyRef.current === revisionKey && lastLoadedSceneKeyRef.current !== '') {
      return;
    }

    try {
      isLoadingSceneRef.current = true;
      setStatusMessage('Loading building scene...');
      let res: Response;
      if (currentBuilding) {
        res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/sync-from-2d`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ building: currentBuilding }),
        });
      } else {
        res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene`);
      }
      if (!res.ok) {
        throw new Error(`Failed to load scene (${res.status})`);
      }
      const data = await res.json() as any;
      if (Array.isArray(data.warnings)) {
        setWarnings(data.warnings);
      }
      if (data.scene) {
        lastLoadedSceneKeyRef.current = revisionKey;
        postToStudio({
          type: 'LOAD_SCENE',
          projectId,
          scene: data.scene,
        });
        setStatusMessage(data.source === 'saved' ? 'Loaded saved scene' : 'Generated from 2D plan');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Error loading scene: ${msg}`);
    } finally {
      isLoadingSceneRef.current = false;
    }
  }, [projectId, postToStudio]);

  useEffect(() => {
    if (studioReady) {
      postToStudio({ type: 'SET_PAUSED', paused });
    }
  }, [paused, studioReady, postToStudio]);

  useEffect(() => {
    if (studioReady && building) {
      void loadSceneFromBackend();
    }
  }, [studioReady, building?.id, building?.version, building?.updatedAt, loadSceneFromBackend]);

  useEffect(() => {
    if (activeFloorId && studioReady && levelModeRef.current === 'solo') {
      postToStudio({
        type: 'SELECT_LEVEL',
        levelId: `level_${activeFloorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      });
    }
  }, [activeFloorId, studioReady, postToStudio]);

  useEffect(() => {
    if (reloadKey && studioReady) {
      void loadSceneFromBackend(true);
    }
  }, [reloadKey, studioReady, loadSceneFromBackend]);

  // Ping polling interval to ensure handshake completes quickly
  useEffect(() => {
    if (studioReady) return;

    let pingAttempts = 0;
    const interval = setInterval(() => {
      pingAttempts++;
      postToStudio({ type: 'PING' });
      // If no response after 8 attempts (3.2 seconds), assume ready as fallback so buttons are never permanently disabled
      if (pingAttempts >= 8) {
        clearInterval(interval);
        setStudioReady(true);
        void loadSceneFromBackend();
      }
    }, 400);

    return () => clearInterval(interval);
  }, [studioReady, postToStudio, loadSceneFromBackend]);

  // Handle postMessage events from the embedded sub-app
  useEffect(() => {
    const handleMessage = async (event: MessageEvent<unknown>) => {
      if (!isValidBridgeOrigin(event.origin)) return;
      if (!isStudioMessage(event.data)) return;

      const message = event.data as StudioToHostMessage;

      switch (message.type) {
        case 'STUDIO_READY': {
          setStudioReady(true);
          if (message.webgpuSupported === false) {
            setHasWebGpu(false);
          }
          await loadSceneFromBackend();
          break;
        }

        case 'SCENE_LOADED': {
          setStatusMessage(`Scene loaded (${message.nodeCount} nodes)`);
          break;
        }

        case 'NODE_SELECTED': {
          if (message.nodeId) {
            setSelectedNode({
              id: message.nodeId,
              type: message.nodeType || '',
              data: message.nodeData,
            });
            setIsPropertiesOpen(true);
          }
          break;
        }

        case 'SCENE_DIRTY': {
          setIsDirty(message.dirty);
          break;
        }

        case 'SCENE_MUTATED': {
          if (message.syncOrigin === 'pascal-studio') {
            try {
              isSyncingFrom3dRef.current = true;
              const putRes = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scene: message.scene }),
              });
              if (putRes.ok) {
                const resData = await putRes.json() as any;
                if (resData.building) {
                  onBuildingUpdate?.(resData.building);
                }
              }
            } catch (err) {
              console.warn('Failed to live-sync 3D scene mutation to backend:', err);
            } finally {
              setTimeout(() => {
                isSyncingFrom3dRef.current = false;
              }, 400);
            }
          }
          break;
        }

        case 'SCENE_SAVED_PAYLOAD': {
          try {
            const putRes = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scene: message.scene }),
            });
            if (!putRes.ok) throw new Error(`Save failed (${putRes.status})`);
            const resData = await putRes.json() as any;
            if (resData.building) {
              onBuildingUpdate?.(resData.building);
            }
            setIsDirty(false);
            setSaving(false);
            setStatusMessage('3D scene saved & 2D plan updated');
          } catch (err) {
            setSaving(false);
            const msg = err instanceof Error ? err.message : String(err);
            setStatusMessage(`Failed to save: ${msg}`);
          }
          break;
        }

        case 'IFC_IMPORTED': {
          setIsDirty(true);
          setStatusMessage(`Imported ${message.fileName} (${message.nodeCount} nodes)`);
          break;
        }

        case 'STUDIO_ERROR': {
          setStatusMessage(`Studio error: ${message.message}`);
          setSaving(false);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId, loadSceneFromBackend, postToStudio]);

  const handleToggleLevelMode = (mode: 'solo' | 'stacked' | 'exploded') => {
    setLevelMode(mode);
    setWallMode(mode === 'solo' ? 'cutaway' : 'up');
    postToStudio({ type: 'SET_LEVEL_MODE', mode });
    if (mode === 'solo' && activeFloorId) {
      postToStudio({
        type: 'SELECT_LEVEL',
        levelId: `level_${activeFloorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        isolate: true,
      });
    }
  };

  const handleToggleWallMode = (mode: 'cutaway' | 'up') => {
    setWallMode(mode);
    postToStudio({ type: 'SET_WALL_MODE', mode });
  };

  const handleToggleWalkthrough = () => {
    setWalkthroughActive((prev) => {
      const next = !prev;
      postToStudio({ type: 'SET_WALKTHROUGH_MODE', enabled: next });
      setStatusMessage(next ? 'First-person Walk Inside active (WASD + mouse, Esc/V to exit)' : 'Exited Walk Inside mode');
      return next;
    });
  };

  const handleToggleMeasure = () => {
    setMeasureActive((prev) => {
      const next = !prev;
      postToStudio({ type: 'SET_MEASURE_MODE', enabled: next });
      setStatusMessage(next ? '3D Tape Measure active (Click two points to measure)' : 'Measure tool deactivated');
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleToggleWalkthrough();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMeasure();
      } else if (e.key === 'Escape') {
        if (walkthroughActive) {
          handleToggleWalkthrough();
        } else if (isPropertiesOpen) {
          setIsPropertiesOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [walkthroughActive, isPropertiesOpen]);

  const handleUpdateDoor = (doorId: string, updates: Partial<Door>) => {
    if (!building) return;
    const updatedFloors = building.floors.map((floor) => ({
      ...floor,
      doors: floor.doors.map((d) => (d.id === doorId ? { ...d, ...updates } : d)),
    }));
    const updatedBuilding = { ...building, floors: updatedFloors };
    onBuildingUpdate?.(updatedBuilding);
    setIsDirty(true);

    const pascalDoorId = `door_${doorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    postToStudio({
      type: 'UPDATE_NODE',
      nodeId: pascalDoorId,
      patch: {
        width: updates.width !== undefined ? updates.width / 1000 : undefined,
        height: updates.height !== undefined ? updates.height / 1000 : undefined,
        swingDirection: updates.swingDirection === SwingDirection.Outward ? 'outward' : 'inward',
      },
    });
  };

  const handleUpdateWindow = (winId: string, updates: Partial<Window>) => {
    if (!building) return;
    const updatedFloors = building.floors.map((floor) => ({
      ...floor,
      windows: floor.windows.map((w) => (w.id === winId ? { ...w, ...updates } : w)),
    }));
    const updatedBuilding = { ...building, floors: updatedFloors };
    onBuildingUpdate?.(updatedBuilding);
    setIsDirty(true);

    const pascalWinId = `window_${winId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    postToStudio({
      type: 'UPDATE_NODE',
      nodeId: pascalWinId,
      patch: {
        width: updates.width !== undefined ? updates.width / 1000 : undefined,
        height: updates.height !== undefined ? updates.height / 1000 : undefined,
        sillHeight: updates.sillHeight !== undefined ? updates.sillHeight / 1000 : undefined,
      },
    });
  };

  const handleUpdateFurniture = (itemId: string, updates: Partial<CanonicalFurnitureItem>) => {
    if (!building) return;
    const updatedFloors = building.floors.map((floor) => ({
      ...floor,
      furniture: floor.furniture?.map((f) => (f.id === itemId ? { ...f, ...updates } : f)) ?? [],
    }));
    const updatedBuilding = { ...building, floors: updatedFloors };
    onBuildingUpdate?.(updatedBuilding);
    setIsDirty(true);

    const pascalItemId = `item_${itemId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const patch: Record<string, any> = {};
    if (updates.elevationMm !== undefined) {
      patch.position = [undefined, updates.elevationMm / 1000, undefined];
    }
    if (updates.rotationDeg !== undefined) {
      patch.rotation = [0, (updates.rotationDeg * Math.PI) / 180, 0];
    }
    if (updates.kind !== undefined) {
      patch.asset = { id: updates.kind, src: `/pascal-studio/assets/furniture/${updates.kind}.glb` };
    }
    postToStudio({
      type: 'UPDATE_NODE',
      nodeId: pascalItemId,
      patch,
    });
  };

  const handleDeleteElement = (elementId: string, elementType: string) => {
    if (!building) return;
    const updatedFloors = building.floors.map((floor) => ({
      ...floor,
      doors: elementType === 'door' ? floor.doors.filter((d) => d.id !== elementId) : floor.doors,
      windows: elementType === 'window' ? floor.windows.filter((w) => w.id !== elementId) : floor.windows,
      furniture: elementType === 'item' ? floor.furniture?.filter((f) => f.id !== elementId) : floor.furniture,
    }));
    const updatedBuilding = { ...building, floors: updatedFloors };
    onBuildingUpdate?.(updatedBuilding);
    setIsDirty(true);

    const pascalId = `${elementType}_${elementId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    postToStudio({
      type: 'DELETE_NODE',
      nodeId: pascalId,
    });
    setSelectedNode(null);
  };

  const handleSelectNodeById = (nodeId: string, type: string) => {
    setSelectedNode({ id: nodeId, type });
    setIsPropertiesOpen(true);
    postToStudio({
      type: 'SELECT_LEVEL',
      levelId: nodeId,
    });
  };

  const handleSave = () => {
    setSaving(true);
    setStatusMessage('Saving 3D scene...');
    const requestId = `save_${Date.now()}`;
    postToStudio({ type: 'REQUEST_SAVE', requestId });
  };

  const handleReset = () => {
    setIsResetConfirmOpen(true);
  };

  const executeReset = async () => {
    setIsResetConfirmOpen(false);
    setResetting(true);
    setStatusMessage('Resetting scene from 2D plan...');
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building }),
      });
      if (!res.ok) throw new Error(`Reset failed (${res.status})`);
      const data = await res.json() as any;
      if (Array.isArray(data.warnings)) {
        setWarnings(data.warnings);
      }
      if (data.scene) {
        postToStudio({
          type: 'LOAD_SCENE',
          projectId,
          scene: data.scene,
        });
        setIsDirty(false);
        setStatusMessage('Scene reset from 2D plan');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Reset error: ${msg}`);
    } finally {
      setResetting(false);
    }
  };

  const handleIfcFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusMessage(`Importing ${file.name}...`);
    try {
      const buffer = await file.arrayBuffer();
      postToStudio({
        type: 'IMPORT_IFC_BUFFER',
        fileName: file.name,
        buffer,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`IFC reading error: ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyAiEditPrompt = async (promptText: string): Promise<{ appliedCount: number }> => {
    setAiEditing3d(true);
    setStatusMessage('Applying 3D AI edit...');

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/ai-edit/3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `AI 3D edit request failed (${res.status})`);
      }

      const data = await res.json();
      if (data.status === 'applied') {
        postToStudio({
          type: 'LOAD_SCENE',
          projectId,
          scene: data.scene,
        });

        setIsDirty(true);
        const ops = data.appliedOperations?.length || 1;
        setAppliedOpsCount(ops);
        setStatusMessage(`3D edit applied (${ops} operations)`);
        return { appliedCount: ops };
      } else {
        const refusalMsg = data.refusals?.join('; ') || data.error || '3D edit could not be applied';
        setStatusMessage('3D edit rejected');
        throw new Error(refusalMsg);
      }
    } finally {
      setAiEditing3d(false);
    }
  };

  const handlePlaceCatalogItem = async (item: CatalogPlacementItem) => {
    if (!building) return;
    setStatusMessage(`Placing ${item.name} in 3D...`);

    const activeFloor = building.floors.find(f => f.id === activeFloorId) ?? building.floors[0];
    if (!activeFloor) return;

    let updatedBuilding: Building;

    if (item.type === 'interior') {
      const targetRoom = activeFloor.rooms.find(r => {
        const typeStr = String(r.type).toUpperCase();
        if (item.kind?.includes('bed') && typeStr.includes('BED')) return true;
        if (item.kind?.includes('sofa') && typeStr.includes('LIV')) return true;
        if (item.kind?.includes('tv') && typeStr.includes('LIV')) return true;
        if (item.kind?.includes('dining') && (typeStr.includes('DIN') || typeStr.includes('LIV'))) return true;
        if (item.kind?.includes('kitchen') && typeStr.includes('KIT')) return true;
        if ((item.kind?.includes('wc') || item.kind?.includes('shower') || item.kind?.includes('basin')) && typeStr.includes('BATH')) return true;
        return false;
      }) ?? activeFloor.rooms[0];

      const cx = targetRoom ? targetRoom.x + targetRoom.width / 2 : 5000;
      const cy = targetRoom ? targetRoom.y + targetRoom.height / 2 : 5000;
      const w = item.defaultWidthMm;
      const d = item.defaultDepthMm ?? 800;

      const newFurniture = {
        id: `furn_${item.kind ?? item.id}_${Date.now().toString(36)}`,
        type: (item.kind?.includes('bed') ? 'bed' : item.kind?.includes('sofa') ? 'sofa' : item.kind?.includes('toilet') || item.kind?.includes('wc') ? 'toilet' : item.kind?.includes('shower') ? 'shower' : item.kind?.includes('table') ? 'table' : item.kind?.includes('fan') ? 'ceiling_fan' : item.kind?.includes('light') ? 'downlight' : 'table') as any,
        roomId: targetRoom?.id ?? 'room_1',
        floorId: activeFloor.id,
        category: (item.categoryType ?? 'furniture') as any,
        kind: item.kind ?? item.id,
        label: item.name,
        mountType: item.mountType ?? 'floor',
        xMm: Math.round(cx - w / 2),
        yMm: Math.round(cy - d / 2),
        widthMm: w,
        depthMm: d,
        heightMm: item.defaultHeightMm ?? 800,
        elevationMm: item.mountType === 'ceiling' ? 2600 : 0,
        rotationDeg: 0,
        layer: 'A-FURN' as const,
      };

      const updatedFloors = building.floors.map(f =>
        f.id === activeFloor.id ? { ...f, furniture: [...(f.furniture ?? []), newFurniture] } : f
      );
      updatedBuilding = { ...building, floors: updatedFloors };
    } else {
      setStatusMessage(`Selected ${item.name} for placement`);
      return;
    }

    onBuildingUpdate?.(updatedBuilding);

    // Live sync to Pascal 3D scene
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building: updatedBuilding }),
      });
      if (res.ok) {
        const data = await res.json() as any;
        if (data.scene) {
          postToStudio({
            type: 'LOAD_SCENE',
            projectId,
            scene: data.scene,
          });
          setIsDirty(true);
          setStatusMessage(`Placed ${item.name} in 3D scene`);
        }
      }
    } catch (err) {
      console.warn('Failed to live-sync placed catalog item to 3D scene:', err);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* WebGPU fallback notice if not supported */}
      {!hasWebGpu && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              WebGPU is recommended for high-performance Pascal 3D rendering. If you experience performance limits, you can switch back to Standard 3D.
            </span>
          </div>
          {onFallbackToStandard && (
            <button
              onClick={onFallbackToStandard}
              className="px-2.5 py-1 text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded border border-amber-500/40 transition shrink-0 ml-4"
            >
              Switch to Standard 3D
            </button>
          )}
        </div>
      )}

      {/* Pascal Studio Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Pascal 3D Studio</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              Beta
            </span>
          </div>

          {statusMessage && (
            <span className="text-slate-400 text-xs border-l border-slate-800 pl-3">
              {statusMessage}
            </span>
          )}

          {isDirty && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px]">
              Unsaved 3D edits
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Warnings Pill if non-empty */}
          {warnings.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setWarningsExpanded(!warningsExpanded)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 transition"
                title="View translation notes"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{warnings.length} notice{warnings.length > 1 ? 's' : ''}</span>
                {warningsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {warningsExpanded && (
                <div className="absolute right-0 top-full mt-1.5 w-80 p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-xl text-xs text-slate-300 z-30 space-y-1.5">
                  <div className="font-medium text-slate-200 border-b border-slate-800 pb-1">
                    Canonical to Pascal Notices
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 max-h-48 overflow-y-auto">
                    {warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Import IFC */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleIfcFileSelect}
            accept=".ifc"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!studioReady}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 transition"
            title="Import an IFC model buffer into Pascal scene"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Import IFC</span>
          </button>

          {/* Reset from 2D Plan */}
          <button
            data-testid="pascal-reset-from-2d-btn"
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 transition"
            title="Discard 3D edits and regenerate fresh from 2D plan"
          >
            {resetting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Reset from 2D</span>
          </button>

          {/* Save 3D Edits */}
          <button
            onClick={handleSave}
            disabled={!studioReady || saving}
            className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition ${
              isDirty
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            } disabled:opacity-50`}
            title="Save manual 3D adjustments"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Save 3D Edits</span>
          </button>

          {/* AI 3D Edit Drawer Button */}
          <button
            type="button"
            data-testid="pascal-ai-3d-btn"
            onClick={() => setIsAiDrawerOpen(true)}
            disabled={!studioReady}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold transition shadow-xs cursor-pointer"
            title="Open AI 3D Scene Mutation Drawer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 3D Edit</span>
          </button>

          {/* Elements Catalog Drawer Button */}
          <button
            type="button"
            data-testid="pascal-elements-catalog-btn"
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
            title="Open Doors, Windows & Staircase Elements Catalog"
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-400" />
            <span>Elements Catalog</span>
          </button>

          {/* Floor Isolation Mode Pill */}
          <div className="flex items-center rounded bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
            <button
              data-testid="floor-mode-isolate"
              type="button"
              onClick={() => handleToggleLevelMode('solo')}
              className={`px-2 py-0.5 rounded transition ${
                levelMode === 'solo'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Isolate Active Floor (Hide other floors)"
            >
              Isolate Floor
            </button>
            <button
              data-testid="floor-mode-stacked"
              type="button"
              onClick={() => handleToggleLevelMode('stacked')}
              className={`px-2 py-0.5 rounded transition ${
                levelMode === 'stacked'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show All Floors Stacked"
            >
              All Floors
            </button>
            <button
              data-testid="floor-mode-exploded"
              type="button"
              onClick={() => handleToggleLevelMode('exploded')}
              className={`px-2 py-0.5 rounded transition ${
                levelMode === 'exploded'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exploded Floor View"
            >
              Exploded
            </button>
          </div>

          {/* Wall Cutaway Mode Pill */}
          <div className="flex items-center rounded bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
            <button
              data-testid="wall-mode-cutaway"
              type="button"
              onClick={() => handleToggleWallMode('cutaway')}
              className={`px-2 py-0.5 rounded transition ${
                wallMode === 'cutaway'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cutaway Walls for Interior Visibility"
            >
              Cutaway
            </button>
            <button
              data-testid="wall-mode-full"
              type="button"
              onClick={() => handleToggleWallMode('up')}
              className={`px-2 py-0.5 rounded transition ${
                wallMode === 'up'
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Height Walls"
            >
              Full Walls
            </button>
          </div>

          {/* Walk Inside Button */}
          <button
            data-testid="walkthrough-btn"
            type="button"
            onClick={handleToggleWalkthrough}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
              walkthroughActive
                ? 'bg-amber-600 border-amber-500 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Walk Inside in First-Person (Press V)"
          >
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span>Walk Inside</span>
            <span className="text-[10px] text-slate-400 font-mono">V</span>
          </button>

          {/* Measure Tool Button */}
          <button
            data-testid="measure-btn"
            type="button"
            onClick={handleToggleMeasure}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
              measureActive
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="3D Tape Measure (Press M)"
          >
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            <span>Measure</span>
            <span className="text-[10px] text-slate-400 font-mono">M</span>
          </button>

          {/* Properties Inspector Button */}
          <button
            data-testid="properties-inspector-btn"
            type="button"
            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition font-medium cursor-pointer ${
              isPropertiesOpen
                ? 'bg-sky-600 border-sky-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle 3D Element Properties Inspector"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Properties</span>
            {selectedNode && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Embedded Pascal Studio Sub-App — 100% Full Bleed, Zero Bottom Overlays */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/pascal-studio/"
          title="Pascal 3D Studio"
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%', minHeight: '600px', border: 0 }}
          allow="accelerometer; camera; encrypted-media; gyroscope; microphone"
          onLoad={() => {
            postToStudio({ type: 'PING' });
          }}
        />

        {/* 3D Element Properties Inspector (Scoped strictly to 3D Viewport) */}
        <ElementPropertiesInspector
          isOpen={isPropertiesOpen}
          onClose={() => setIsPropertiesOpen(false)}
          selectedNode={selectedNode}
          building={building}
          activeFloorId={activeFloorId}
          onUpdateDoor={handleUpdateDoor}
          onUpdateWindow={handleUpdateWindow}
          onUpdateFurniture={handleUpdateFurniture}
          onDeleteElement={handleDeleteElement}
          onSelectNodeById={handleSelectNodeById}
        />
      </div>

      {/* AI 3D Scene Edit Drawer (Collapsible Right Slide-Over, Zero Bottom Collision) */}
      <Ai3DEditDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onApplyPrompt={handleApplyAiEditPrompt}
        isSubmitting={aiEditing3d}
        studioReady={studioReady}
        onResetFrom2D={handleReset}
      />

      {/* 3D Elements Catalog Drawer (Collapsible Right Slide-Over) */}
      <ElementsCatalogDrawer
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onPlaceElement={handlePlaceCatalogItem}
      />

      {/* Reset Confirmation Themed Modal (No native browser alert) */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset 3D Scene to 2D Plan"
        message="Discard manual 3D scene adjustments and regenerate clean geometry from the active 2D floor plan?"
        confirmLabel="Reset 3D Scene"
        isDestructive={true}
        onConfirm={executeReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
