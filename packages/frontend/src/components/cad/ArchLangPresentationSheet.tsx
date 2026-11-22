import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Building } from '@ai-floor-planner/core';
import type { ArchLangRoomInfo, RoomLockImpactAnalysis } from '@ai-floor-planner/interop';
import {
  fetchArchLangPreview,
  fetchRoomLockImpact,
  type ArchLangPreviewResponse,
} from '../../services/archlang-client';
import {
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Maximize2,
  Compass,
  FileCode,
  ShieldAlert,
  Info,
  Send,
  Loader2,
  Undo2,
} from 'lucide-react';

export interface ArchLangPresentationSheetProps {
  building: Building;
  floorId: string;
  lockedRoomIds?: string[];
  onLockedRoomsChange?: (lockedIds: string[]) => void;
}

interface DisplayDiagnostic {
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
  line?: number;
  col?: number;
}

export const ArchLangPresentationSheet: React.FC<ArchLangPresentationSheetProps> = ({
  building,
  floorId,
  lockedRoomIds = [],
  onLockedRoomsChange,
}) => {
  const [autoFurnish, setAutoFurnish] = useState(true);
  const [circulationOverlay, setCirculationOverlay] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [localLockedIds, setLocalLockedIds] = useState<string[]>(lockedRoomIds);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ArchLangPreviewResponse['preview'] | null>(null);
  const [impactData, setImpactData] = useState<RoomLockImpactAnalysis | null>(null);

  const [showDiagnosticsPopover, setShowDiagnosticsPopover] = useState(false);
  const [showLockPanel, setShowLockPanel] = useState(true);

  // Phase 4: AI Edit state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiEditing, setAiEditing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiModified, setIsAiModified] = useState(false);
  const [originalPreviewData, setOriginalPreviewData] = useState<ArchLangPreviewResponse['preview'] | null>(null);
  const [aiResult, setAiResult] = useState<{ attempts: number; changedElements?: any[] } | null>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Sync with prop when external lockedRoomIds change
  useEffect(() => {
    setLocalLockedIds(lockedRoomIds);
  }, [lockedRoomIds]);

  // Load preview data whenever floorId, options, or building changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const preview = await fetchArchLangPreview(
          building,
          {
            floorId,
            autoFurnish,
            circulationOverlay,
            showDimensions,
            lockedRoomIds: localLockedIds,
          },
          controller.signal
        );

        setPreviewData(preview);

        // Fetch room lock impact
        if (localLockedIds.length > 0) {
          const impact = await fetchRoomLockImpact(building, floorId, localLockedIds, undefined, controller.signal);
          setImpactData(impact);
        } else {
          setImpactData(null);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(err.message ?? 'Failed to render ArchLang presentation sheet');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [building, floorId, autoFurnish, circulationOverlay, showDimensions, localLockedIds]);

  const toggleRoomLock = (roomId: string) => {
    const nextLocked = localLockedIds.includes(roomId)
      ? localLockedIds.filter((id) => id !== roomId)
      : [...localLockedIds, roomId];

    setLocalLockedIds(nextLocked);
    onLockedRoomsChange?.(nextLocked);
  };

  const handleZoom = (factor: number) => {
    setScale((prev) => Math.min(Math.max(prev * factor, 0.4), 4));
  };

  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleApplyAiEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim() || aiEditing) return;

    setAiEditing(true);
    setAiError(null);

    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(building.projectId || building.id)}/ai-edit/2d`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            building,
            floorId,
            currentDsl: previewData?.dslSource,
            prompt: aiPrompt.trim(),
            lockedRoomIds: localLockedIds,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `AI Edit request failed (${res.status})`);
      }

      const data = await res.json();
      if (data.status === 'applied') {
        if (!isAiModified && previewData) {
          setOriginalPreviewData(previewData);
        }
        setIsAiModified(true);
        setPreviewData((prev) =>
          prev
            ? {
                ...prev,
                svg: data.svg,
                dslSource: data.dslSource,
                validation: {
                  valid: true,
                  errors: [],
                  warnings: data.diagnostics || [],
                },
              }
            : null
        );
        setAiResult({
          attempts: data.attempts,
          changedElements: data.changedElements,
        });
        setAiPrompt('');
      } else {
        setAiError(data.error || 'AI edit rejected due to room lock or geometry constraints.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to apply AI edit');
    } finally {
      setAiEditing(false);
    }
  };

  const handleRevertAiEdit = () => {
    if (originalPreviewData) {
      setPreviewData(originalPreviewData);
      setOriginalPreviewData(null);
    }
    setIsAiModified(false);
    setAiResult(null);
    setAiError(null);
  };

  // Rooms list derived from roomMap or canonical floor
  const roomsList: ArchLangRoomInfo[] = useMemo(() => {
    if (previewData?.roomMap) {
      return Object.values(previewData.roomMap);
    }
    const currentFloor = building.floors.find((f) => f.id === floorId);
    if (!currentFloor) return [];
    return currentFloor.rooms.map((r) => ({
      id: r.id,
      archId: r.id.replace(/[^a-zA-Z0-9_]/g, '_'),
      name: r.name || r.type,
      type: r.type,
      areaMm2: (r.width || 0) * (r.height || 0),
      bounds: { x: r.x, y: r.y, width: r.width, height: r.height },
      locked: localLockedIds.includes(r.id),
    }));
  }, [previewData, building, floorId, localLockedIds]);

  const totalAreaM2 = useMemo(() => {
    const sumMm2 = roomsList.reduce((acc, r) => acc + r.areaMm2, 0);
    return (sumMm2 / 1_000_000).toFixed(1);
  }, [roomsList]);

  const lockedAreaM2 = useMemo(() => {
    const sumMm2 = roomsList.filter((r) => r.locked).reduce((acc, r) => acc + r.areaMm2, 0);
    return (sumMm2 / 1_000_000).toFixed(1);
  }, [roomsList]);

  const lockedPercentage = useMemo(() => {
    const total = roomsList.reduce((acc, r) => acc + r.areaMm2, 0);
    if (total === 0) return 0;
    const locked = roomsList.filter((r) => r.locked).reduce((acc, r) => acc + r.areaMm2, 0);
    return Math.round((locked / total) * 100);
  }, [roomsList]);

  const allDiagnostics: DisplayDiagnostic[] = useMemo(() => {
    if (!previewData?.validation) return [];
    return [
      ...(previewData.validation.errors || []).map((e) => ({ ...e, severity: 'error' as const })),
      ...(previewData.validation.warnings || []).map((w) => ({ ...w, severity: 'warning' as const })),
      ...(previewData.warnings || []).map((msg) => ({ message: msg, severity: 'info' as const })),
    ];
  }, [previewData]);

  const isGeometryValid = previewData?.validation?.valid !== false && (previewData?.validation?.errors?.length ?? 0) === 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-950 text-slate-100">
      {/* ArchLang Presentation Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            ArchLang 2D Presentation Engine
          </span>

          <span className="text-slate-600">|</span>

          {/* Auto-Furnish Toggle */}
          <button
            type="button"
            onClick={() => setAutoFurnish(!autoFurnish)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              autoFurnish
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Toggle deterministic automatic furniture placement in ArchLang"
          >
            <Layers className="h-3.5 w-3.5" />
            Auto-Furnish
          </button>

          {/* Circulation Overlay Toggle */}
          <button
            type="button"
            onClick={() => setCirculationOverlay(!circulationOverlay)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              circulationOverlay
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Overlay entrance-to-room circulation routes & key bottlenecks"
          >
            <Compass className="h-3.5 w-3.5" />
            Circulation Overlay
          </button>

          {/* Dimensions Toggle */}
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              showDimensions
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Toggle architectural dimension strings in ArchLang presentation"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Dimensions
          </button>

          {/* Toggle Room Lock Panel */}
          <button
            type="button"
            onClick={() => setShowLockPanel(!showLockPanel)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              showLockPanel || localLockedIds.length > 0
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Open Room Locking padlocks panel for Phase 4 AI editing"
          >
            <Lock className="h-3.5 w-3.5" />
            Room Locks ({localLockedIds.length})
          </button>
        </div>

        {/* Right side: Diagnostics Pill & View Controls */}
        <div className="flex items-center gap-2">
          {/* Validation Status Pill */}
          <button
            type="button"
            onClick={() => setShowDiagnosticsPopover(!showDiagnosticsPopover)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isGeometryValid
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {isGeometryValid ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>✓ Geometry Valid</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>⚠ {allDiagnostics.length} Diagnostics</span>
              </>
            )}
          </button>

          {/* Pan & Zoom Controls */}
          <div className="flex items-center gap-1 rounded bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => handleZoom(1.2)}
              className="rounded p-1 text-slate-300 hover:bg-slate-700"
              title="Zoom In"
              aria-label="Zoom in presentation"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="rounded p-1 text-slate-300 hover:bg-slate-700"
              title="Zoom Out"
              aria-label="Zoom out presentation"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="rounded p-1 text-slate-300 hover:bg-slate-700"
              title="Reset View"
              aria-label="Reset presentation view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area: Canvas + Optional Lock Side Panel */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* SVG Presentation Canvas */}
        <div
          className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow-xl">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                Compiling ArchLang 2D Presentation Sheet...
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
              <div className="max-w-md rounded-xl border border-red-500/40 bg-red-950/40 p-5 text-center text-red-200 backdrop-blur">
                <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-red-400" />
                <h4 className="font-semibold">ArchLang Compilation Error</h4>
                <p className="mt-1 text-xs text-red-300">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && previewData?.svg && (
            <div
              className="flex h-full w-full items-center justify-center p-8 transition-transform duration-75 select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
              dangerouslySetInnerHTML={{ __html: previewData.svg }}
            />
          )}

          {/* Quick HUD watermark */}
          <div className="pointer-events-none absolute bottom-16 left-3 z-10 flex items-center gap-2 rounded border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur">
            <span>Floor: <strong className="text-slate-200">{previewData?.floorName ?? floorId}</strong></span>
            <span>·</span>
            <span>Zoom: <strong>{Math.round(scale * 100)}%</strong></span>
            <span>·</span>
            <span>Scale: <strong>1:100 Metric</strong></span>
          </div>

          {/* Phase 4: Bottom AI Edit Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-1.5">
            {aiError && (
              <div className="flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/80 px-3 py-1.5 text-xs text-red-200 backdrop-blur">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiError(null)}
                  className="text-red-400 hover:text-red-200 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            <form
              onSubmit={handleApplyAiEdit}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur"
            >
              <div className="flex items-center pl-2.5 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>

              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to edit this floor (e.g., 'Enlarge living room and add study nook')..."
                disabled={aiEditing}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
              />

              {isAiModified && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    AI Modified {aiResult ? `(Attempt ${aiResult.attempts})` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleRevertAiEdit}
                    className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-slate-300 border border-slate-700 transition"
                    title="Revert to original canonical floor plan"
                  >
                    <Undo2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Revert</span>
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={aiEditing || !aiPrompt.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
              >
                {aiEditing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Editing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Apply AI Edit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Room Lock Panel (Sidebar) */}
        {showLockPanel && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-800 bg-slate-900/95 p-4 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Lock className="h-4 w-4 text-purple-400" />
                Room Padlocks
              </h3>
              <span className="rounded bg-purple-950/80 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                Phase 4 Ready
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Lock rooms to protect their geometry and layout from being altered during AI editing.
            </p>

            {/* Impact Metric Card */}
            <div className="my-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span>Locked Floor Area:</span>
                <span className="text-purple-300">
                  {lockedAreaM2} m² ({lockedPercentage}%)
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${lockedPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Floor Area: {totalAreaM2} m²</span>
                <span>{localLockedIds.length} of {roomsList.length} locked</span>
              </div>

              {impactData?.adjacentRoomIds && impactData.adjacentRoomIds.length > 0 && (
                <div className="mt-2 border-t border-slate-800/80 pt-2 text-[11px] text-amber-300">
                  ⚠ {impactData.adjacentRoomIds.length} adjacent rooms share locked boundary walls.
                </div>
              )}
            </div>

            {/* Room List with Padlock Toggles */}
            <div className="space-y-1.5">
              {roomsList.map((room) => {
                const isLocked = localLockedIds.includes(room.id);
                const isAdjacent = impactData?.adjacentRoomIds?.includes(room.id);
                const areaM2 = (room.areaMm2 / 1_000_000).toFixed(1);

                return (
                  <div
                    key={room.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                      isLocked
                        ? 'border-purple-500/40 bg-purple-950/30 text-purple-200'
                        : isAdjacent
                        ? 'border-amber-500/30 bg-amber-950/20 text-slate-300'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <span>{room.name}</span>
                        {isLocked && (
                          <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">
                            LOCKED
                          </span>
                        )}
                        {!isLocked && isAdjacent && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300" title="Adjacent to a locked room boundary">
                            CONSTRAINED
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        {room.type} · {areaM2} m²
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleRoomLock(room.id)}
                      className={`rounded p-1.5 transition-colors ${
                        isLocked
                          ? 'bg-purple-600 text-white hover:bg-purple-500'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                      title={isLocked ? 'Unlock this room' : 'Lock this room to prevent modification'}
                      aria-label={isLocked ? `Unlock room ${room.name}` : `Lock room ${room.name}`}
                    >
                      {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Diagnostics Popover Drawer */}
        {showDiagnosticsPopover && (
          <div className="absolute right-4 top-4 z-30 max-h-96 w-96 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FileCode className="h-4 w-4 text-cyan-400" />
                ArchLang Compiler Diagnostics ({allDiagnostics.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowDiagnosticsPopover(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {allDiagnostics.length === 0 ? (
              <p className="mt-3 text-xs text-emerald-300">
                ✓ No errors or warnings reported by the ArchLang compiler.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {allDiagnostics.map((d, idx) => (
                  <div
                    key={idx}
                    className={`rounded border p-2 text-xs ${
                      d.severity === 'error'
                        ? 'border-red-500/40 bg-red-950/30 text-red-200'
                        : d.severity === 'warning'
                        ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                        : 'border-slate-700 bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      {d.severity === 'error' && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                      {d.severity === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                      {d.severity === 'info' && <Info className="h-3.5 w-3.5 text-cyan-400" />}
                      <span>{d.code || d.severity.toUpperCase()}</span>
                      {d.line !== undefined && <span className="text-[10px] text-slate-400">(Line {d.line})</span>}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{d.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
