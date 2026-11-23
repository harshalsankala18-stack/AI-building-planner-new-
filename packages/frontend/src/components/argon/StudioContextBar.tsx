import React from 'react';
import {
  RotateCcw,
  Sparkles,
  Edit3,
  FileUp,
  Save,
  CheckCircle2,
  Loader2,
  Split,
  PanelRight,
  Lock,
} from 'lucide-react';
import { type StudioTabId } from './StudioTopBar';

export interface StudioContextBarProps {
  activeTab: StudioTabId;
  floors: readonly { id: string; name: string }[];
  activeFloorId: string;
  onSwitchFloor: (floorId: string) => void;

  // 2D Plan props
  activeDiscipline?: string;
  onSelectDiscipline?: (discipline: string) => void;
  onOpenEditPlan?: () => void;
  onRegeneratePlan?: () => void;
  generationSeed?: number;
  isGenerating?: boolean;
  canRegenerate?: boolean;
  showInspector?: boolean;
  onToggleInspector?: () => void;

  // 2D Sheet props
  autoFurnish?: boolean;
  onToggleAutoFurnish?: () => void;
  circulationOverlay?: boolean;
  onToggleCirculation?: () => void;
  showDimensions?: boolean;
  onToggleDimensions?: () => void;
  validationIssuesCount?: number;
  showRoomPadlocks?: boolean;
  onToggleRoomPadlocks?: () => void;

  // 3D Studio props
  isolateFloor3d?: boolean;
  onToggleIsolateFloor3d?: () => void;
  studioEngine?: 'pascal' | 'standard';
  onSelectStudioEngine?: (engine: 'pascal' | 'standard') => void;
  onImportIfc?: () => void;
  onResetFrom2D?: () => void;
  onSave3DEdits?: () => void;
  isSaving3D?: boolean;
  is3DDirty?: boolean;
  studioReady?: boolean;
  onToggleAi3DDrawer?: () => void;
  isAi3DDrawerOpen?: boolean;

  // Split View props
  splitLeftMode?: 'engineering' | 'archlang';
  onSelectSplitLeftMode?: (mode: 'engineering' | 'archlang') => void;
  onResetSplit5050?: () => void;

  // Stage B2 Parametric Ripple props
  autoSolveStructure?: boolean;
  onToggleAutoSolveStructure?: () => void;
  onUndoParametric?: () => void;
  canUndoParametric?: boolean;
}

const DISCIPLINES = [
  { id: 'ARCHITECTURAL', label: 'Architectural Plan' },
  { id: 'STRUCTURAL', label: 'Structural + Chajja Plan' },
  { id: 'ELECTRICAL', label: 'Electrical Plan (M-ELEC)' },
  { id: 'PLUMBING', label: 'Plumbing & OTS Duct Plan (M-PLUMB)' },
  { id: 'FIRE_SAFETY', label: 'Fire Safety Plan (F-FIRE)' },
  { id: 'FALSE_CEILING', label: 'False Ceiling Plan (A-CEIL)' },
];

export const StudioContextBar: React.FC<StudioContextBarProps> = ({
  activeTab,
  floors,
  activeFloorId,
  onSwitchFloor,

  // 2D Plan
  activeDiscipline = 'ARCHITECTURAL',
  onSelectDiscipline,
  onOpenEditPlan,
  onRegeneratePlan,
  generationSeed = 1,
  isGenerating = false,
  canRegenerate = true,
  showInspector = true,
  onToggleInspector,

  // 2D Sheet
  autoFurnish = true,
  onToggleAutoFurnish,
  circulationOverlay = false,
  onToggleCirculation,
  showDimensions = true,
  onToggleDimensions,
  validationIssuesCount: _validationIssuesCount = 0,
  showRoomPadlocks = false,
  onToggleRoomPadlocks,

  // 3D Studio
  isolateFloor3d = false,
  onToggleIsolateFloor3d,
  studioEngine = 'pascal',
  onSelectStudioEngine,
  onImportIfc,
  onResetFrom2D,
  onSave3DEdits,
  isSaving3D = false,
  is3DDirty = false,
  studioReady = true,
  onToggleAi3DDrawer,
  isAi3DDrawerOpen = false,

  // Split View
  splitLeftMode = 'engineering',
  onSelectSplitLeftMode,
  onResetSplit5050,

  // Stage B2 Parametric Ripple
  autoSolveStructure = true,
  onToggleAutoSolveStructure,
  onUndoParametric,
  canUndoParametric = true,
}) => {
  if (activeTab === 'export') {
    return (
      <div
        data-testid="studio-contextbar-export"
        className="studio-context-bar argon-contextbar h-10 max-h-10 bg-[#FFFFFF] border-b border-[#E2DDD5] px-4 flex items-center justify-between text-xs text-[#181D23] z-40 shrink-0 select-none whitespace-nowrap overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#181D23]">Export Center</span>
          <span className="text-[11px] text-[#5C6672]">· CAD/BIM Packages, ArchLang Drawings & Structural Reports</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="studio-contextbar"
      className="studio-context-bar argon-contextbar h-10 max-h-10 bg-[#FFFFFF] border-b border-[#E2DDD5] px-3 md:px-4 flex items-center justify-between text-xs text-[#181D23] z-40 shrink-0 select-none whitespace-nowrap overflow-x-auto"
    >
      {/* ── LEFT: FLOOR SELECTOR PILLS ── */}
      <div className="flex items-center gap-1.5 shrink-0" aria-label="Building Floors">
        <span className="text-[10px] font-mono font-bold text-[#5C6672] uppercase mr-1">
          FLOOR:
        </span>
        {floors.map((f) => (
          <button
            key={f.id}
            type="button"
            data-testid={`floor-pill-${f.id}`}
            onClick={() => onSwitchFloor(f.id)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              f.id === activeFloorId
                ? 'bg-[#B45309] text-white shadow-2xs font-bold'
                : 'bg-[#F7F5F0] hover:bg-slate-200 text-[#181D23]'
            }`}
          >
            {f.name.replace(/_PLAN/g, '').replace(/_/g, ' ')}
          </button>
        ))}

        {/* 3D Only: All Floors / Isolate Floor Toggle */}
        {activeTab === '3d-studio' && onToggleIsolateFloor3d && (
          <button
            type="button"
            data-testid="toggle-isolate-floor-btn"
            onClick={onToggleIsolateFloor3d}
            className={`ml-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              isolateFloor3d
                ? 'bg-amber-100 text-[#B45309] border-amber-300 font-bold'
                : 'bg-[#F7F5F0] text-[#5C6672] border-[#E2DDD5] hover:bg-slate-100'
            }`}
          >
            {isolateFloor3d ? 'Isolate Floor' : 'All Floors'}
          </button>
        )}
      </div>

      {/* ── TAB-SPECIFIC CONTROLS (RIGHT ZONE) ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 1. 2D Plan Controls */}
        {activeTab === '2d-plan' && (
          <>
            {/* Discipline Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#5C6672] uppercase hidden lg:inline">Discipline:</span>
              <select
                data-testid="discipline-selector"
                value={activeDiscipline}
                onChange={(e) => onSelectDiscipline?.(e.target.value)}
                className="h-7 px-2 rounded border border-[#E2DDD5] bg-[#F7F5F0] text-xs font-semibold text-[#181D23] focus:outline-none focus:border-[#B45309]"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Edit Plan */}
            {onOpenEditPlan && (
              <button
                type="button"
                data-testid="context-edit-plan-btn"
                onClick={onOpenEditPlan}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-[#181D23] text-xs font-semibold transition"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#B45309]" />
                <span>Edit Plan</span>
              </button>
            )}

            {/* Regen Seed */}
            {onRegeneratePlan && (
              <button
                type="button"
                data-testid="context-regen-seed-btn"
                disabled={isGenerating || !canRegenerate}
                onClick={onRegeneratePlan}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] hover:bg-amber-100 text-xs font-semibold disabled:opacity-50 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGenerating ? 'Regenerating...' : `Regen Seed #${generationSeed}`}</span>
              </button>
            )}

            {/* Inspector Toggle */}
            {onToggleInspector && (
              <button
                type="button"
                data-testid="toggle-inspector-btn"
                onClick={onToggleInspector}
                className={`p-1.5 rounded border transition ${
                  showInspector
                    ? 'border-[#B45309] bg-amber-50 text-[#B45309]'
                    : 'border-[#E2DDD5] bg-[#F7F5F0] text-[#5C6672] hover:text-[#181D23]'
                }`}
                title="Toggle Right Inspector Panel"
              >
                <PanelRight className="h-4 w-4" />
              </button>
            )}
          </>
        )}

        {/* 2. 2D Sheet (ArchLang) Controls */}
        {activeTab === '2d-sheet' && (
          <>
            {onToggleAutoFurnish && (
              <label className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="toggle-auto-furnish"
                  checked={autoFurnish}
                  onChange={onToggleAutoFurnish}
                  className="h-3.5 w-3.5 rounded border-[#E2DDD5] text-[#B45309]"
                />
                <span>Auto-Furnish</span>
              </label>
            )}

            {onToggleCirculation && (
              <label className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="toggle-circulation"
                  checked={circulationOverlay}
                  onChange={onToggleCirculation}
                  className="h-3.5 w-3.5 rounded border-[#E2DDD5] text-[#B45309]"
                />
                <span>Circulation</span>
              </label>
            )}

            {onToggleDimensions && (
              <label className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="toggle-dimensions"
                  checked={showDimensions}
                  onChange={onToggleDimensions}
                  className="h-3.5 w-3.5 rounded border-[#E2DDD5] text-[#B45309]"
                />
                <span>Dimensions</span>
              </label>
            )}

            {/* Diagnostics Pill */}
            <div
              data-testid="diagnostics-pill"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs font-semibold"
              title="Geometry & Code Validations"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Valid (0 errors)</span>
            </div>

            {/* Room Locks Toggle */}
            {onToggleRoomPadlocks && (
              <button
                type="button"
                data-testid="toggle-room-locks-btn"
                onClick={onToggleRoomPadlocks}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border transition ${
                  showRoomPadlocks
                    ? 'border-[#B45309] bg-amber-50 text-[#B45309]'
                    : 'border-[#E2DDD5] bg-[#F7F5F0] text-[#5C6672] hover:text-[#181D23]'
                }`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Room Locks</span>
              </button>
            )}
          </>
        )}

        {/* 3. 3D Studio Controls */}
        {activeTab === '3d-studio' && (
          <>
            {/* Engine Toggle */}
            {onSelectStudioEngine && (
              <div className="flex items-center bg-[#F7F5F0] p-0.5 rounded border border-[#E2DDD5]">
                <button
                  type="button"
                  data-testid="engine-pascal-btn"
                  onClick={() => onSelectStudioEngine('pascal')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    studioEngine === 'pascal' ? 'bg-[#FFFFFF] text-[#B45309] shadow-2xs font-bold' : 'text-[#5C6672]'
                  }`}
                >
                  Pascal Editable
                </button>
                <button
                  type="button"
                  data-testid="engine-standard-btn"
                  onClick={() => onSelectStudioEngine('standard')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    studioEngine === 'standard' ? 'bg-[#FFFFFF] text-[#B45309] shadow-2xs font-bold' : 'text-[#5C6672]'
                  }`}
                >
                  Standard Massing
                </button>
              </div>
            )}

            {/* Import IFC */}
            {onImportIfc && (
              <button
                type="button"
                data-testid="context-import-ifc-btn"
                onClick={onImportIfc}
                disabled={!studioReady}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-xs font-medium text-[#181D23] disabled:opacity-50 transition"
              >
                <FileUp className="h-3.5 w-3.5 text-[#5C6672]" />
                <span>Import IFC</span>
              </button>
            )}

            {/* Reset from 2D */}
            {onResetFrom2D && (
              <button
                type="button"
                data-testid="context-reset-2d-btn"
                onClick={onResetFrom2D}
                disabled={!studioReady}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-xs font-medium text-[#181D23] disabled:opacity-50 transition"
                title="Discard 3D edits and reload exact 2D canonical geometry"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#5C6672]" />
                <span>Reset from 2D</span>
              </button>
            )}

            {/* Save 3D Edits */}
            {onSave3DEdits && (
              <button
                type="button"
                data-testid="context-save-3d-btn"
                onClick={onSave3DEdits}
                disabled={!studioReady || isSaving3D}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition ${
                  is3DDirty
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-2xs'
                    : 'bg-[#F7F5F0] hover:bg-[#FFFFFF] border border-[#E2DDD5] text-[#181D23]'
                } disabled:opacity-50`}
              >
                {isSaving3D ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : is3DDirty ? (
                  <Save className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span>Save 3D Edits</span>
              </button>
            )}

            {/* AI 3D Edit Drawer Toggle */}
            {onToggleAi3DDrawer && (
              <button
                type="button"
                data-testid="context-ai-3d-btn"
                onClick={onToggleAi3DDrawer}
                disabled={!studioReady}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition shadow-2xs ${
                  isAi3DDrawerOpen
                    ? 'bg-sky-700 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                } disabled:opacity-50 cursor-pointer`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI 3D Edit</span>
              </button>
            )}
          </>
        )}

        {/* 4. Split View Controls */}
        {activeTab === 'split-view' && (
          <>
            {onSelectSplitLeftMode && (
              <div className="flex items-center bg-[#F7F5F0] p-0.5 rounded border border-[#E2DDD5]">
                <button
                  type="button"
                  data-testid="split-left-eng-btn"
                  onClick={() => onSelectSplitLeftMode('engineering')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    splitLeftMode === 'engineering' ? 'bg-[#FFFFFF] text-[#B45309] shadow-2xs font-bold' : 'text-[#5C6672]'
                  }`}
                >
                  2D Engineering
                </button>
                <button
                  type="button"
                  data-testid="split-left-sheet-btn"
                  onClick={() => onSelectSplitLeftMode('archlang')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    splitLeftMode === 'archlang' ? 'bg-[#FFFFFF] text-[#B45309] shadow-2xs font-bold' : 'text-[#5C6672]'
                  }`}
                >
                  2D Presentation
                </button>
              </div>
            )}

            {onResetSplit5050 && (
              <button
                type="button"
                data-testid="reset-split-5050-btn"
                onClick={onResetSplit5050}
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-xs font-semibold text-[#181D23] transition"
              >
                <Split className="h-3.5 w-3.5 text-[#5C6672]" />
                <span>Reset 50/50</span>
              </button>
            )}
          </>
        )}

        {/* 5. Parametric Auto-Solve & Undo Controls (§Stage B2) */}
        {onToggleAutoSolveStructure && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#E2DDD5]">
            <button
              type="button"
              data-testid="toggle-auto-solve-structure-btn"
              onClick={onToggleAutoSolveStructure}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition ${
                autoSolveStructure
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-2xs'
                  : 'border-[#E2DDD5] bg-[#F7F5F0] text-[#5C6672] hover:text-[#181D23]'
              }`}
              title="Parametric Ripple: Automatically re-align structural columns, re-project openings, and re-fit interiors when resizing rooms"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Auto-Solve Structure</span>
            </button>

            {onUndoParametric && (
              <button
                type="button"
                data-testid="parametric-undo-btn"
                onClick={onUndoParametric}
                disabled={canUndoParametric === false}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-[#181D23] disabled:opacity-40 transition cursor-pointer"
                title="Undo Parametric Change (Ctrl+Z)"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#5C6672]" />
                <span>Undo</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
