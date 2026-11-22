import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Send,
} from 'lucide-react';
import {
  isStudioMessage,
  isValidBridgeOrigin,
  type HostToStudioMessage,
  type StudioToHostMessage,
} from '@ai-floor-planner/interop/bridge';

export interface PascalStudioFrameProps {
  readonly projectId: string;
  readonly onFallbackToStandard?: () => void;
  readonly reloadKey?: number;
}

export const PascalStudioFrame: React.FC<PascalStudioFrameProps> = ({
  projectId,
  onFallbackToStandard,
  reloadKey,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasWebGpu, setHasWebGpu] = useState<boolean>(true);
  const [studioReady, setStudioReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningsExpanded, setWarningsExpanded] = useState(false);

  // Phase 4: 3D AI editing state
  const [aiPrompt3d, setAiPrompt3d] = useState('');
  const [aiEditing3d, setAiEditing3d] = useState(false);
  const [aiError3d, setAiError3d] = useState<string | null>(null);
  const [appliedOpsCount, setAppliedOpsCount] = useState<number | null>(null);

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
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene`);
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
  }, [projectId, postToStudio]);

  useEffect(() => {
    if (reloadKey && studioReady) {
      void loadSceneFromBackend();
    }
  }, [reloadKey, studioReady, loadSceneFromBackend]);

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

        case 'SCENE_SAVED_PAYLOAD': {
          try {
            const putRes = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scene: message.scene }),
            });
            if (!putRes.ok) throw new Error(`Save failed (${putRes.status})`);
            setIsDirty(false);
            setSaving(false);
            setStatusMessage('3D scene saved');
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

  const handleReset = async () => {
    if (!window.confirm('Reset 3D scene from the latest 2D floor plan? Any manual 3D overrides will be replaced.')) {
      return;
    }
    setResetting(true);
    setStatusMessage('Resetting scene from 2D plan...');
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/pascal-scene/reset`, {
        method: 'POST',
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

  const handleApplyAiEdit3d = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt3d.trim() || aiEditing3d) return;

    setAiEditing3d(true);
    setAiError3d(null);
    setStatusMessage('Applying 3D AI edit...');

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/ai-edit/3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt3d.trim() }),
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
        setAppliedOpsCount(data.appliedOperations?.length || 0);
        setStatusMessage(`3D edit applied (${data.appliedOperations?.length || 0} operations)`);
        setAiPrompt3d('');
      } else {
        const refusalMsg = data.refusals?.join('; ') || data.error || '3D edit could not be applied';
        setAiError3d(refusalMsg);
        setStatusMessage('3D edit rejected');
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiError3d(msg);
      setStatusMessage(`Error: ${msg}`);
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
            onClick={handleReset}
            disabled={!studioReady || resetting}
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
        </div>
      </div>

      {/* Embedded Pascal Studio Sub-App */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/pascal-studio/"
          title="Pascal 3D Studio"
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%', minHeight: '600px', border: 0 }}
          allow="accelerometer; camera; encrypted-media; gyroscope; microphone"
        />

        {/* Phase 4: Bottom AI 3D Edit Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-1.5 max-w-2xl mx-auto">
          {aiError3d && (
            <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/85 px-3 py-1.5 text-xs text-red-200 backdrop-blur">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{aiError3d}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiError3d(null)}
                className="text-red-400 hover:text-red-200 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={handleApplyAiEdit3d}
            className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center pl-2.5 text-sky-400">
              <Sparkles className="h-4 w-4" />
            </div>

            <input
              type="text"
              value={aiPrompt3d}
              onChange={(e) => setAiPrompt3d(e.target.value)}
              placeholder="Ask AI to edit 3D scene (e.g., 'Furnish living room with sofa', 'Add window on north wall')..."
              disabled={aiEditing3d || !studioReady}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
            />

            {appliedOpsCount !== null && (
              <span className="rounded bg-sky-950/80 px-2 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-500/30 shrink-0">
                {appliedOpsCount} ops applied
              </span>
            )}

            <button
              type="submit"
              disabled={aiEditing3d || !studioReady || !aiPrompt3d.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
            >
              {aiEditing3d ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Mutating...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply 3D Edit</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
