import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { EngineeringOverlay } from '@ai-floor-planner/core';
import {
  GeometryValidator,
  evaluateArchitecturalComplianceScore,
} from '@ai-floor-planner/planning-engine';
import type { EditorContextValue } from '../../stores/editor-store';
import { ArchitecturalCanvas } from '../canvas/ArchitecturalCanvas';
import { PropertyInspector } from '../inspector/PropertyInspector';
import { requestVerifiedExport, downloadVerifiedExport } from '../../services/export-client';
import type { WorkspaceLayer } from '../workspace/BuildingNavigator';
import { ArchLangPresentationSheet } from '../cad/ArchLangPresentationSheet';
import { PascalStudioFrame } from '../model-3d/PascalStudioFrame';
import { ModelWorkspace } from '../model-3d/ModelWorkspace';

export type StudioWorkspaceMode = 'engineering' | 'archlang' | '3d-standard' | '3d-pascal' | 'split-view';

export interface ArchitecturalCADWorkspaceProps {
  editor: EditorContextValue;
  onRegeneratePlan?: () => void;
  onOpenEditPlan?: () => void;
  generationSeed?: number;
  isGenerating?: boolean;
  canRegenerate?: boolean;
  mode?: StudioWorkspaceMode;
  onModeChange?: (mode: StudioWorkspaceMode) => void;
  hideToolbars?: boolean;
  showInspector?: boolean;
  activeDiscipline?: string;
  onDisciplineChange?: (discipline: string) => void;
}

export const ArchitecturalCADWorkspace: React.FC<ArchitecturalCADWorkspaceProps> = ({
  editor,
  onRegeneratePlan,
  onOpenEditPlan,
  generationSeed = 1,
  isGenerating = false,
  canRegenerate = true,
  mode,
  onModeChange,
  hideToolbars = false,
  showInspector = true,
  activeDiscipline = 'ARCHITECTURAL',
  onDisciplineChange,
}) => {
  const aiTelemetry = editor.building.metadata.generationBrief?.aiTelemetry;
  const [internalMode, setInternalMode] = useState<StudioWorkspaceMode>('engineering');
  const workspaceMode = mode ?? internalMode;
  const setWorkspaceMode = (nextMode: StudioWorkspaceMode) => {
    setInternalMode(nextMode);
    onModeChange?.(nextMode);
  };
  const [sync3dCount, setSync3dCount] = useState<number>(0);
  const [lockedRoomIds, setLockedRoomIds] = useState<string[]>([]);
  const [entityLayers, setEntityLayers] = useState({ columns: false, beams: false, furniture: true });
  const [disciplines, setDisciplines] = useState<Record<EngineeringOverlay, boolean>>({
    ARCHITECTURAL: true,
    STRUCTURAL: false,
    ELECTRICAL: false,
    PLUMBING: false,
    FALSE_CEILING: false,
    FIRE_SAFETY: false,
  });

  useEffect(() => {
    const normalized = String(activeDiscipline || 'ARCHITECTURAL').toUpperCase() as EngineeringOverlay;
    if (
      normalized === 'ARCHITECTURAL' ||
      normalized === 'STRUCTURAL' ||
      normalized === 'ELECTRICAL' ||
      normalized === 'PLUMBING' ||
      normalized === 'FALSE_CEILING' ||
      normalized === 'FIRE_SAFETY'
    ) {
      setDisciplines((prev) => ({
        ...prev,
        ARCHITECTURAL: true,
        STRUCTURAL: normalized === 'STRUCTURAL',
        ELECTRICAL: normalized === 'ELECTRICAL',
        PLUMBING: normalized === 'PLUMBING',
        FALSE_CEILING: normalized === 'FALSE_CEILING',
        FIRE_SAFETY: normalized === 'FIRE_SAFETY',
      }));
    }
  }, [activeDiscipline]);
  const [exportStatus, setExportStatus] = useState('');
  const controller = React.useRef(new AbortController());
  React.useEffect(() => {
    controller.current.abort();
    controller.current = new AbortController();
    setExportStatus('');
    return () => controller.current.abort();
  }, [editor.building, editor.activeFloor.id]);
  const snapshot = React.useRef(editor.building);
  snapshot.current = editor.building;
  const quickExport = async (format: 'dwg' | 'dxf' | 'pdf') => {
    const building = editor.building,
      signal = controller.current.signal;
    setExportStatus('Generating / verifying...');
    try {
      const artifact = await requestVerifiedExport(
        building,
        format,
        { floorId: editor.activeFloor.id, scale: 'FIT_TO_PAGE' },
        signal,
      );
      if (signal.aborted || snapshot.current !== building)
        throw new Error('Stale revision: export again');
      await downloadVerifiedExport(artifact, signal);
      setExportStatus(`VERIFIED ${artifact.sizeBytes} bytes · ${artifact.sha256?.slice(0, 12)}`);
    } catch (e) {
      setExportStatus(String(e));
    }
  };
  const [layers, setLayers] = useState<Record<WorkspaceLayer, boolean>>({
    rooms: true,
    walls: true,
    openings: true,
    stairs: true,
    dimensions: true,
    grid: false,
    validation: true,
    siteZones: true,
  });
  const report = useMemo(
    () => new GeometryValidator({ autoCorrect: false }).audit(editor.building, false).report,
    [editor.building],
  );
  const complianceReport = useMemo(
    () =>
      (editor.building.metadata as { complianceReport?: ReturnType<typeof evaluateArchitecturalComplianceScore> })
        ?.complianceReport ?? evaluateArchitecturalComplianceScore(editor.building),
    [editor.building],
  );
  return (
    <section
      className="flex h-full min-h-0 flex-col bg-slate-950 text-slate-100"
      aria-label="Architectural CAD workspace"
    >
      {/* CONDITIONAL ACTION BAR: Hidden when controlled by unified StudioContextBar */}
      {!hideToolbars && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
            {/* Left: Floor Selector + Quick Actions */}
            <div className="flex items-center gap-2 overflow-x-auto" aria-label="Model floors">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">Floor:</span>
              {editor.building.floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => editor.switchFloor(floor.id)}
                  className={`shrink-0 rounded px-2.5 py-1 text-xs font-semibold transition ${
                    floor.id === editor.activeFloor.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {floor.name}
                </button>
              ))}

              {onRegeneratePlan && (
                <button
                  type="button"
                  disabled={isGenerating || !canRegenerate}
                  onClick={onRegeneratePlan}
                  className="ml-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 text-xs font-semibold disabled:opacity-50 transition"
                >
                  {isGenerating ? 'Regenerating...' : `Regen Seed #${generationSeed}`}
                </button>
              )}

              {onOpenEditPlan && (
                <button
                  type="button"
                  onClick={onOpenEditPlan}
                  className="rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-2.5 py-1 text-xs font-semibold transition"
                >
                  Edit Plan
                </button>
              )}
            </div>

            {/* Right: Telemetry, Compliance Score, Export */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  aiTelemetry?.geminiInvoked
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300'
                }`}
              >
                {aiTelemetry?.geminiInvoked
                  ? `Gemini AI (${aiTelemetry.modelUsed ?? 'gemini'})`
                  : 'Deterministic Engine'}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  complianceReport.score >= 85 && complianceReport.redConflictCount === 0
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                }`}
              >
                Compliance Score: {complianceReport.score} / 100
              </span>
              {(['dwg', 'dxf', 'pdf'] as const).map((format) => (
                <button
                  key={format}
                  className="rounded bg-slate-800 px-3 py-2 text-xs"
                  onClick={() => void quickExport(format)}
                >
                  Export {format.toUpperCase()}
                </button>
              ))}
              <span role="status" className="text-xs text-amber-200">
                {exportStatus}
              </span>
            </div>
          </div>

          {workspaceMode === 'engineering' && (
            <div
              className="argon-tool-strip argon-discipline-toolbar flex flex-wrap items-center gap-1.5"
              role="toolbar"
              aria-label="Engineering discipline overlay switcher"
            >
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Discipline Plans:
              </span>
              {(
                [
                  ['ARCHITECTURAL', 'Architectural Plan'],
                  ['STRUCTURAL', 'Structural + Chajja Plan'],
                  ['ELECTRICAL', 'Electrical Plan (M-ELEC)'],
                  ['PLUMBING', 'Plumbing & OTS Duct Plan (M-PLUMB)'],
                  ['FIRE_SAFETY', 'Fire Safety Plan (F-FIRE)'],
                  ['FALSE_CEILING', 'False Ceiling Plan (A-CEIL)'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={disciplines[key]}
                  onClick={() => {
                    const nextVal = !disciplines[key];
                    setDisciplines((p) => ({ ...p, [key]: nextVal }));
                    if (key === 'STRUCTURAL') {
                      setEntityLayers((p) => ({ ...p, columns: nextVal, beams: nextVal }));
                    }
                  }}
                  className={`shrink-0 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    disciplines[key]
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {workspaceMode === 'archlang' && (
        <ArchLangPresentationSheet
          building={editor.building}
          floorId={editor.activeFloor.id}
          lockedRoomIds={lockedRoomIds}
          onLockedRoomsChange={setLockedRoomIds}
        />
      )}

      {workspaceMode === '3d-standard' && (
        <div className="flex-1 min-h-0 relative">
          <ModelWorkspace
            building={editor.building}
            activeFloorId={editor.activeFloor.id}
            selection={editor.selection}
            onSelectEntity={editor.selectEntity}
            onClearSelection={editor.clearSelection}
            onSwitchFloor={editor.switchFloor}
            onApplyBuilding={editor.applyRefinement}
            generationControl={editor.generationControl}
          />
        </div>
      )}

      {workspaceMode === '3d-pascal' && (
        <div className="flex-1 min-h-0 relative">
          <PascalStudioFrame
            projectId={editor.building.projectId}
            building={editor.building}
            onBuildingUpdate={(updatedBuilding) => editor.setBuilding(updatedBuilding)}
            activeFloorId={editor.activeFloor.id}
            reloadKey={sync3dCount}
            onFallbackToStandard={() => setWorkspaceMode('3d-standard')}
          />
        </div>
      )}

      {workspaceMode === 'split-view' && (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden border-t border-slate-800">
          <div className="flex-1 min-w-0 min-h-[350px] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
            <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">2D Presentation Plan (ArchLang)</span>
              <span className="text-[10px] text-slate-400">Room locks & verified compile</span>
            </div>
            <div className="flex-1 min-h-0">
              <ArchLangPresentationSheet
                building={editor.building}
                floorId={editor.activeFloor.id}
                lockedRoomIds={lockedRoomIds}
                onLockedRoomsChange={setLockedRoomIds}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0 min-h-[350px] flex flex-col">
            <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-400">3D Pascal Studio</span>
              <button
                type="button"
                onClick={() => setSync3dCount((c) => c + 1)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-[11px] font-semibold transition"
                title="Sync 2D Plan modifications into 3D Scene"
              >
                <RefreshCw className="w-3 h-3 text-sky-400" />
                <span>Sync 2D → 3D Studio</span>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <PascalStudioFrame
                projectId={editor.building.projectId}
                building={editor.building}
                onBuildingUpdate={(updatedBuilding) => editor.setBuilding(updatedBuilding)}
                activeFloorId={editor.activeFloor.id}
                reloadKey={sync3dCount}
                onFallbackToStandard={() => setWorkspaceMode('3d-standard')}
              />
            </div>
          </div>
        </div>
      )}

      {workspaceMode === 'engineering' && (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Main 2D Canvas */}
          <div
            data-testid="cad-canvas-host"
            className="cad-canvas-host relative min-h-[320px] min-w-0 flex-1 overflow-hidden"
          >
            <ArchitecturalCanvas
              modelOnly
              entityLayers={entityLayers}
              disciplines={disciplines}
              editor={editor}
              snapEnabled
              layers={layers}
              fitRequest={0}
            />

            {/* Floating Layer Pill Bar (Pinned 16px above bottom-left) */}
            <div
              data-testid="cad-layer-pill-bar"
              className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1 p-1 rounded-full border border-slate-700/80 bg-slate-950/85 backdrop-blur-md shadow-2xl text-[11px]"
            >
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase px-2">Layers</span>
              {(['walls', 'openings', 'stairs', 'dimensions'] as const).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  aria-pressed={layers[layer]}
                  onClick={() => setLayers((p) => ({ ...p, [layer]: !p[layer] }))}
                  className={`px-2.5 py-1 rounded-full font-medium transition ${
                    layers[layer]
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {
                    {
                      walls: 'Walls',
                      openings: 'Doors/Windows',
                      stairs: 'Staircases',
                      dimensions: 'Dimensions',
                    }[layer]
                  }
                </button>
              ))}
              {(['columns', 'beams', 'furniture'] as const).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  data-testid={`cad-pill-${layer}`}
                  aria-pressed={entityLayers[layer]}
                  onClick={() => setEntityLayers((p) => ({ ...p, [layer]: !p[layer] }))}
                  className={`px-2.5 py-1 rounded-full font-medium transition ${
                    entityLayers[layer]
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {layer[0]!.toUpperCase() + layer.slice(1)}
                </button>
              ))}
              <span className="h-3 w-px bg-slate-700 mx-0.5" aria-hidden="true" />
              <button
                type="button"
                data-testid="cad-pill-electrical"
                aria-pressed={disciplines.ELECTRICAL}
                onClick={() => {
                  const nextVal = !disciplines.ELECTRICAL;
                  setDisciplines((p) => ({ ...p, ELECTRICAL: nextVal }));
                  onDisciplineChange?.(nextVal ? 'ELECTRICAL' : 'ARCHITECTURAL');
                }}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  disciplines.ELECTRICAL
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-slate-800'
                }`}
              >
                Electrical
              </button>
              <button
                type="button"
                data-testid="cad-pill-plumbing"
                aria-pressed={disciplines.PLUMBING}
                onClick={() => {
                  const nextVal = !disciplines.PLUMBING;
                  setDisciplines((p) => ({ ...p, PLUMBING: nextVal }));
                  onDisciplineChange?.(nextVal ? 'PLUMBING' : 'ARCHITECTURAL');
                }}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  disciplines.PLUMBING
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : 'text-sky-300/80 hover:text-sky-200 hover:bg-slate-800'
                }`}
              >
                Plumbing
              </button>
              <button
                type="button"
                data-testid="cad-pill-fire-safety"
                aria-pressed={disciplines.FIRE_SAFETY}
                onClick={() => {
                  const nextVal = !disciplines.FIRE_SAFETY;
                  setDisciplines((p) => ({ ...p, FIRE_SAFETY: nextVal }));
                  onDisciplineChange?.(nextVal ? 'FIRE_SAFETY' : 'ARCHITECTURAL');
                }}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  disciplines.FIRE_SAFETY
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-rose-300/80 hover:text-rose-200 hover:bg-slate-800'
                }`}
              >
                Fire Safety
              </button>
            </div>

            {(disciplines.ELECTRICAL || disciplines.PLUMBING || disciplines.FIRE_SAFETY || entityLayers.beams) && (
              <div
                data-testid="mep-cad-legend"
                className="absolute bottom-14 left-4 z-20 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-950/90 text-[10px] font-mono text-slate-200 shadow-xl backdrop-blur-md pointer-events-none"
              >
                {entityLayers.beams && (
                  <>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-amber-600" />B1 Primary</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-sky-600" />SB1 Secondary</span>
                  </>
                )}
                {disciplines.ELECTRICAL && (
                  <>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-amber-500" />C1-LT Lighting</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-sky-500" />C2-PWR 16A</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-teal-400" />C3-AC Split</span>
                  </>
                )}
                {disciplines.PLUMBING && (
                  <>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-sky-500" />Cold Ø20</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-orange-500" />Hot Ø20</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-amber-900" />Soil Ø110</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-emerald-600" />Waste Ø75</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-indigo-500" />Rain Ø100</span>
                  </>
                )}
                {disciplines.FIRE_SAFETY && (
                  <>
                    <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-red-600" />FE / FHR / SD</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-red-600" />Fire Riser</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-0.5 bg-green-500" />Emergency Egress</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Collapsible 300px Right Inspector Panel */}
          {showInspector && (
            <aside
              data-testid="property-inspector-drawer"
              className="w-[300px] shrink-0 border-l border-[#E2DDD5] bg-[#FFFFFF] p-4 overflow-y-auto text-xs text-[#181D23] shadow-lg animate-slideInRight"
            >
              <PropertyInspector editor={editor} embedded />
              <div className="border-t border-[#E2DDD5] my-4 pt-3">
                <h2 className="font-bold text-[#181D23]">Geometry Audit · Rev #{editor.building.version}</h2>
                <p className={`my-2 text-xs font-semibold ${report.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {report.isValid ? '✓ INTERNAL GEOMETRY CHECK PASSED' : '⚠ CORRECTION REQUIRED'}
                </p>
                <p className="text-[11px] text-[#5C6672] font-mono">Planar delta: {report.planarDeltaMm2} mm²</p>
                <div className="my-3 flex flex-wrap gap-1.5">
                  {(
                    ['rooms', 'walls', 'openings', 'stairs', 'dimensions', 'grid'] as WorkspaceLayer[]
                  ).map((layer) => (
                    <button
                      key={layer}
                      type="button"
                      aria-pressed={layers[layer]}
                      onClick={() =>
                        setLayers((previous) => ({ ...previous, [layer]: !previous[layer] }))
                      }
                      className={`rounded px-2 py-0.5 text-[10px] font-mono ${
                        layers[layer] ? 'bg-amber-100 text-[#B45309] font-bold' : 'bg-[#F7F5F0] text-[#5C6672]'
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
                {report.errors.length > 0 && (
                  <ul className="space-y-2 text-[11px] mt-2">
                    {report.errors
                      .filter((error) => !error.autoCorrected)
                      .map((error, index) => (
                        <li key={`${error.code}-${index}`} className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">
                          <strong>{error.code}</strong>
                          <p className="mt-0.5">{error.description}</p>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </section>
  );
};
