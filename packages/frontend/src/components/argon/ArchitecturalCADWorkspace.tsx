import React, { useMemo, useState } from 'react';
import { RefreshCw, Columns } from 'lucide-react';
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
}) => {
  const aiTelemetry = editor.building.metadata.generationBrief?.aiTelemetry;
  const activeArchetype = editor.building.metadata.generationBrief?.archetype;
  const activeMassingShape = editor.building.metadata.generationBrief?.buildingMassingShape;
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
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-700 p-3">
        <strong>2D CAD Studio</strong>
        <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-700" role="group" aria-label="CAD Studio mode switcher">
          <button
            type="button"
            onClick={() => setWorkspaceMode('engineering')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${workspaceMode === 'engineering'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            2D Engineering
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('archlang')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${workspaceMode === 'archlang'
              ? 'bg-emerald-500 text-slate-950 shadow'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            2D Presentation (ArchLang)
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('3d-standard')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${workspaceMode === '3d-standard'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            3D Standard
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('3d-pascal')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${workspaceMode === '3d-pascal'
              ? 'bg-sky-500 text-slate-950 shadow'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            3D Pascal Studio (Edit)
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode('split-view')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-colors ${workspaceMode === 'split-view'
              ? 'bg-indigo-500 text-white shadow'
              : 'text-slate-300 hover:text-white'
              }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View (2D + 3D)</span>
          </button>
        </div>
        {onRegeneratePlan && (
          <button
            type="button"
            disabled={isGenerating || !canRegenerate}
            onClick={onRegeneratePlan}
            className="rounded bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {isGenerating ? 'Regenerating...' : `Regenerate Variant (Seed #${generationSeed})`}
          </button>
        )}
        {onOpenEditPlan && (
          <button
            type="button"
            onClick={onOpenEditPlan}
            className="rounded bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
          >
            Edit Plan
          </button>
        )}
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${aiTelemetry?.geminiInvoked
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
            : 'border-slate-600 bg-slate-800 text-slate-300'
            }`}
          title={
            aiTelemetry?.geminiInvoked
              ? `Gemini proposal active (${aiTelemetry.modelUsed ?? 'gemini'})${aiTelemetry.referenceImageUsedForGeometry ? ' + Vision Spatial Graph' : ''}${activeMassingShape ? ` · ${activeMassingShape}` : ''}${activeArchetype ? ` · ${activeArchetype}` : ''}`
              : aiTelemetry?.fallbackReason ?? `Deterministic solver engine${activeMassingShape ? ` · ${activeMassingShape}` : ''}`
          }
        >
          {aiTelemetry?.geminiInvoked
            ? `Gemini AI (${aiTelemetry.modelUsed ?? 'gemini'})`
            : 'Deterministic Engine'}
          {activeMassingShape ? ` · ${activeMassingShape.replace(/_/g, ' ')}` : ''}
        </span>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${complianceReport.score >= 85 && complianceReport.redConflictCount === 0
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
            : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
            }`}
          title={
            (complianceReport?.violations?.length ?? 0) > 0
              ? complianceReport.violations
                .map((v) => (typeof v === 'string' ? v : v.message))
                .join(' | ')
              : 'All 6 architectural & code compliance checks passed (>= 85 / 100).'
          }
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 p-3">
        <div
          className="flex shrink-0 gap-2 overflow-x-auto"
          aria-label="Model floors"
        >
          {editor.building.floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => editor.switchFloor(floor.id)}
              className={`shrink-0 rounded px-3 py-2 text-xs ${floor.id === editor.activeFloor.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'}`}
            >
              {floor.name}
            </button>
          ))}
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
                className={`shrink-0 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${disciplines[key]
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
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
                reloadKey={sync3dCount}
                onFallbackToStandard={() => setWorkspaceMode('3d-standard')}
              />
            </div>
          </div>
        </div>
      )}

      {workspaceMode === 'engineering' && (
        <>
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div className="relative min-h-[320px] min-w-0 flex-1">
              <ArchitecturalCanvas
                modelOnly
                entityLayers={entityLayers}
                disciplines={disciplines}
                editor={editor}
                snapEnabled
                layers={layers}
                fitRequest={0}
              />
            </div>
            <aside className="w-full overflow-auto border-t border-slate-700 bg-slate-900 p-5 lg:w-80 lg:border-l lg:border-t-0">
              <PropertyInspector editor={editor} embedded />
              <h2 className="font-bold">Geometry audit · revision {editor.building.version}</h2>
              <p className={`my-3 text-sm ${report.isValid ? 'text-emerald-300' : 'text-amber-300'}`}>
                {report.isValid ? 'INTERNAL GEOMETRY CHECK PASSED' : 'CORRECTION REQUIRED'}
              </p>
              <p className="text-xs text-slate-300">Measured area delta: {report.planarDeltaMm2} mm²</p>
              <p className="my-3 text-xs text-slate-400">
                This software check does not certify structural safety or regulatory compliance.
                Professional review required.
              </p>
              <div className="my-4 flex flex-wrap gap-2">
                {(
                  ['rooms', 'walls', 'openings', 'stairs', 'dimensions', 'grid'] as WorkspaceLayer[]
                ).map((layer) => (
                  <button
                    key={layer}
                    aria-pressed={layers[layer]}
                    onClick={() =>
                      setLayers((previous) => ({ ...previous, [layer]: !previous[layer] }))
                    }
                    className={`rounded px-2 py-1 text-xs ${layers[layer] ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {layer}
                  </button>
                ))}
              </div>
              <ul className="space-y-3 text-xs">
                {report.errors
                  .filter((error) => !error.autoCorrected)
                  .map((error, index) => (
                    <li key={`${error.code}-${index}`} className="rounded border border-slate-700 p-2">
                      <strong>{error.code}</strong>
                      <p className="mt-1 text-slate-300">{error.description}</p>
                    </li>
                  ))}
              </ul>
            </aside>
          </div>
          <div
            aria-label="CAD layers"
            className="flex shrink-0 flex-wrap gap-2 border-t border-slate-700 bg-slate-900 p-3"
          >
            {(['walls', 'openings', 'stairs', 'dimensions'] as const).map((layer) => (
              <button
                key={layer}
                aria-pressed={layers[layer]}
                onClick={() => setLayers((p) => ({ ...p, [layer]: !p[layer] }))}
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
                aria-pressed={entityLayers[layer]}
                onClick={() => setEntityLayers((p) => ({ ...p, [layer]: !p[layer] }))}
              >
                {layer[0]!.toUpperCase() + layer.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
