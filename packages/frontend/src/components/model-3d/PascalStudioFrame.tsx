import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Building } from '@ai-floor-planner/core';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileUp,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import { Ai3DEditDrawer } from './Ai3DEditDrawer';
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
}

export const PascalStudioFrame: React.FC<PascalStudioFrameProps> = ({
  projectId,
  building,
  onBuildingUpdate,
  onFallbackToStandard,
  reloadKey,
  activeFloorId,
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningsExpanded, setWarningsExpanded] = useState(false);

  // Phase 4: 3D AI editing state
  const [aiEditing3d, setAiEditing3d] = useState(false);
  const [, setAppliedOpsCount] = useState<number | null>(null);

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

  const loadSceneFromBackend = useCallback(async () => {
    try {
      setStatusMessage('Loading building scene...');
      let res: Response;
      if (building) {
        res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/sync-from-2d`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ building }),
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
    }
  }, [projectId, building, postToStudio]);

  useEffect(() => {
    if (activeFloorId && studioReady) {
      postToStudio({
        type: 'SELECT_LEVEL',
        levelId: `level_${activeFloorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      });
    }
  }, [activeFloorId, studioReady, postToStudio]);

  useEffect(() => {
    if (reloadKey && studioReady) {
      void loadSceneFromBackend();
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

        case 'SCENE_DIRTY': {
          setIsDirty(message.dirty);
          break;
        }

        case 'SCENE_MUTATED': {
          if (message.syncOrigin === 'pascal-studio') {
            try {
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
  }, [projectId, loadSceneFromBackend]);

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
