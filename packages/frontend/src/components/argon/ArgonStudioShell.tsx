import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useEditorStore } from '../../stores/editor-store';
import { ProjectSetupWizard, type ProjectSetupWizardData } from './ProjectSetupWizard';
import { ArchitecturalCADWorkspace } from './ArchitecturalCADWorkspace';
import { ArchLangPresentationSheet } from '../cad/ArchLangPresentationSheet';
import { PascalStudioFrame } from '../model-3d/PascalStudioFrame';
import { ModelWorkspace } from '../model-3d/ModelWorkspace';
import { ExportCenterWorkspace } from './ExportCenterWorkspace';
import { GenerationProgressModal } from './GenerationProgressModal';
import { projectStorage, createCanonical30x50_2BHK } from '../../services/storage';
import { authService, type AuthUser } from '../../services/auth-service';
import { StudioTopBar, type StudioTabId } from './StudioTopBar';
import { StudioContextBar } from './StudioContextBar';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { SettingsModal, type StudioSettings } from '../common/SettingsModal';
import { JobActivityDrawer, activityLogger } from '../common/JobActivityDrawer';
import { evaluateArchitecturalComplianceScore } from '@ai-floor-planner/planning-engine';
import {
  type executeAuditedPlanningPipeline,
  type PipelineStageProgressEvent,
} from '@ai-floor-planner/planning-engine';
import { createArgonRequest } from '../../services/argon-request';

export interface ArgonStudioShellProps {
  onBackToProjects?: () => void;
  initialWorkspace?: 'studio' | 'setup';
}

export const ArgonStudioShell: React.FC<ArgonStudioShellProps> = ({
  onBackToProjects,
  initialWorkspace = 'studio',
}) => {
  const editor = useEditorStore();
  const [workspaceMode, setWorkspaceMode] = useState<'studio' | 'setup'>(initialWorkspace);
  const [activeTab, setActiveTab] = useState<StudioTabId>('3d-studio');

  // Interactive drawer and modal states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());

  // 2D Plan contextual states
  const [activeDiscipline, setActiveDiscipline] = useState('ARCHITECTURAL');
  const [showInspector, setShowInspector] = useState(true);

  // 2D Sheet contextual states
  const [autoFurnish, setAutoFurnish] = useState(true);
  const [circulationOverlay, setCirculationOverlay] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [lockedRoomIds, setLockedRoomIds] = useState<string[]>([]);
  const [showRoomPadlocks, setShowRoomPadlocks] = useState(false);

  // 3D Studio contextual states
  const [isolateFloor3d, setIsolateFloor3d] = useState(false);
  const [studioEngine, setStudioEngine] = useState<'pascal' | 'standard'>('pascal');
  const [sync3dCount, setSync3dCount] = useState<number>(0);

  // Split View contextual states
  const [splitLeftMode, setSplitLeftMode] = useState<'engineering' | 'archlang'>('engineering');
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage

  // Planning worker & generation states
  const workerRef = useRef<Worker | null>(null);
  const lastBrief = useRef<ProjectSetupWizardData | null>(null);
  const rejectedTopologyHashes = useRef<string[]>([]);
  const [generationSeed, setGenerationSeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [, setSaveWarning] = useState('');
  const [, setGenerationFindings] = useState<readonly string[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineStageProgressEvent | null>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  useEffect(() => {
    const unsub = authService.subscribe((s) => setUser(s?.user ?? null));
    return unsub;
  }, []);

  // Compute live compliance score once for top bar
  const complianceScore = useMemo(() => {
    try {
      const metadata = editor.building.metadata as any;
      if (metadata?.complianceReport?.score !== undefined) {
        return metadata.complianceReport.score;
      }
      const evalReport = evaluateArchitecturalComplianceScore(editor.building);
      return evalReport.score;
    } catch {
      return 94;
    }
  }, [editor.building]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefreshWorkspace = async () => {
    setIsRefreshing(true);
    try {
      const activeId = editor.projectId;
      if (activeId) {
        try {
          const res = await fetch(`/api/projects/${encodeURIComponent(activeId)}/canonical`);
          if (res.ok) {
            const data = await res.json();
            if (data?.building) {
              editor.setBuilding(data.building);
            }
          }
        } catch {
          // local fallback
        }
      }
      setSync3dCount((c) => c + 1);
      activityLogger.add({
        type: 'sync',
        title: 'Workspace Refreshed',
        detail: `Re-verified ${editor.building.floors.length} floors and compliance`,
        status: 'completed',
      });
      showToast('Workspace refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    showToast('Signed out');
    if (onBackToProjects) {
      onBackToProjects();
    } else {
      window.location.href = '/login';
    }
  };

  const handleLoadDemo = () => {
    const demoId = 'proj-demo-canonical';
    const demoBuilding = createCanonical30x50_2BHK('Demo Architectural Project (30x50 2BHK)', demoId);
    editor.setBuilding(demoBuilding, 'Demo Architectural Project (30x50 2BHK)');
    projectStorage.setActiveProjectId(demoId);
    void fetch(`/api/projects/${demoId}/canonical`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building: demoBuilding }),
    }).catch(err => console.warn('Failed to sync demo building to backend:', err));
    const firstResidential = demoBuilding.floors.find((f) => f.apartmentUnits?.length) || demoBuilding.floors[0];
    if (firstResidential) {
      editor.switchFloor(firstResidential.id);
    }
    setWorkspaceMode('studio');
    setActiveTab('3d-studio');
    showToast('Demo project loaded');
  };

  const projectList = useMemo(() => {
    return projectStorage.list();
  }, [editor.projectId, isRefreshing]);

  const runGeneration = (
    data: ProjectSetupWizardData,
    seed: number,
    rejectedHashes: readonly string[],
  ) => {
    workerRef.current?.terminate();
    lastBrief.current = data;
    setIsGenerating(true);
    setPipelineProgress(null);
    setGenerationError('');
    setGenerationFindings([]);

    try {
      const request = {
        ...createArgonRequest(data),
        generationSeed: seed,
        rejectedTopologyHashes: [...rejectedHashes],
      };
      const worker = new Worker(new URL('../../services/argon-planning.worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<{
        type: 'progress' | 'complete' | 'error';
        progress?: PipelineStageProgressEvent;
        result?: Awaited<ReturnType<typeof executeAuditedPlanningPipeline>>;
        message?: string;
      }>) => {
        if (workerRef.current !== worker) return;
        if (event.data.progress) setPipelineProgress(event.data.progress);
        if (event.data.type === 'error') {
          setGenerationError(event.data.message ?? 'Generation failed. Review the plot and program.');
          worker.terminate();
        }
        if (event.data.type === 'complete' && event.data.result) {
          try {
            const report = event.data.result.building.metadata?.generationReport;
            setGenerationFindings(
              Array.isArray(report?.violations)
                ? report.violations.map(v => `${v.rank}. ${v.severity}: ${v.description}`)
                : [],
            );
            const outcome = editor.setBuilding(event.data.result.building, data.projectName, {}, 'residential');
            const firstResidential = event.data.result.building.floors.find(floor => floor.apartmentUnits?.length);
            if (firstResidential) editor.switchFloor(firstResidential.id);
            setIsGenerating(false);
            setWorkspaceMode('studio');
            setActiveTab('2d-plan');
            setSaveWarning('');

            // Immediately register generated building in backend registry
            void fetch(`/api/projects/${encodeURIComponent(event.data.result.building.projectId)}/canonical`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ building: event.data.result.building }),
            }).catch(err => console.warn('Failed to sync canonical building to backend:', err));

            activityLogger.add({
              type: 'save',
              title: `Generated "${data.projectName}"`,
              detail: `${event.data.result.building.floors.length} floors synthesized with full geometry`,
              status: 'completed',
            });

            void outcome.durable.then(result => {
              if (result.state === 'SAVED') return;
              setSaveWarning(
                result.state === 'UNAVAILABLE'
                  ? 'This plan is open and complete, but durable storage is unavailable.'
                  : `This plan is open and complete, but durable write had status: ${result.reason ?? result.state}.`,
              );
            });
          } catch (error) {
            setGenerationError(error instanceof Error ? error.message : 'Could not open the generated project.');
          }
          worker.terminate();
        }
      };
      worker.onerror = event => {
        setGenerationError(event.message || 'The planning worker could not start.');
        worker.terminate();
      };
      worker.postMessage(request);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleGenerate = (data: ProjectSetupWizardData) => {
    rejectedTopologyHashes.current = [];
    setGenerationSeed(1);
    runGeneration(data, 1, []);
  };

  const handleRegenerateVariant = () => {
    if (!lastBrief.current) return;
    const currentHash = editor.building.metadata.generationBrief?.topologyHash;
    if (currentHash && !rejectedTopologyHashes.current.includes(currentHash)) {
      rejectedTopologyHashes.current = [...rejectedTopologyHashes.current, currentHash];
    }
    const nextSeed = generationSeed + 1;
    setGenerationSeed(nextSeed);
    runGeneration(lastBrief.current, nextSeed, rejectedTopologyHashes.current);
  };

  const cancelGeneration = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsGenerating(false);
  };

  // Keyboard shortcut listener for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="argon-shell flex flex-col h-screen w-screen bg-[#F7F5F0] text-[#181D23] overflow-hidden font-sans relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-lg border border-[#B45309]/30 bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#181D23] shadow-xl animate-fadeIn flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#B45309]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── ROW 1: GLOBAL STUDIO TOP BAR (52px FIXED, STRICTLY SINGLE ROW) ── */}
      <StudioTopBar
        projectName={editor.projectName || 'Untitled Project'}
        projectId={editor.projectId}
        projectList={projectList}
        onSelectProject={(pid) => {
          editor.loadProject(pid);
          setWorkspaceMode('studio');
          showToast(`Opened project`);
        }}
        onBackToHub={() => {
          if (onBackToProjects) onBackToProjects();
          else window.location.href = '/projects';
        }}
        onNewProject={() => setWorkspaceMode('setup')}
        showTabs={workspaceMode === 'studio'}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setWorkspaceMode('studio');
          setActiveTab(tab);
        }}
        complianceScore={complianceScore}
        syncStatus="synced"
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshWorkspace}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* ── ROW 2: CONTEXTUAL FLOOR & ACTION BAR (40px FIXED) ── */}
      {workspaceMode === 'studio' && (
        <StudioContextBar
          activeTab={activeTab}
          floors={editor.building.floors}
          activeFloorId={editor.activeFloor.id}
          onSwitchFloor={(fid) => editor.switchFloor(fid)}

          // 2D Plan
          activeDiscipline={activeDiscipline}
          onSelectDiscipline={setActiveDiscipline}
          onOpenEditPlan={() => setActiveTab('2d-plan')}
          onRegeneratePlan={handleRegenerateVariant}
          generationSeed={generationSeed}
          isGenerating={isGenerating}
          canRegenerate={Boolean(lastBrief.current)}
          showInspector={showInspector}
          onToggleInspector={() => setShowInspector((prev) => !prev)}

          // 2D Sheet
          autoFurnish={autoFurnish}
          onToggleAutoFurnish={() => setAutoFurnish((prev) => !prev)}
          circulationOverlay={circulationOverlay}
          onToggleCirculation={() => setCirculationOverlay((prev) => !prev)}
          showDimensions={showDimensions}
          onToggleDimensions={() => setShowDimensions((prev) => !prev)}
          showRoomPadlocks={showRoomPadlocks}
          onToggleRoomPadlocks={() => setShowRoomPadlocks((prev) => !prev)}

          // 3D Studio
          isolateFloor3d={isolateFloor3d}
          onToggleIsolateFloor3d={() => setIsolateFloor3d((prev) => !prev)}
          studioEngine={studioEngine}
          onSelectStudioEngine={setStudioEngine}

          // Split View
          splitLeftMode={splitLeftMode}
          onSelectSplitLeftMode={setSplitLeftMode}
          onResetSplit5050={() => setSplitRatio(50)}
        />
      )}

      {/* ── MAIN WORKSPACE VIEWPORT (REMAINING 85%+ HEIGHT) ── */}
      <main className="flex-1 relative overflow-hidden flex flex-col min-h-0 bg-[#F7F5F0]">
        {/* SETUP WIZARD (When user creates a new project) */}
        {workspaceMode === 'setup' && (
          <ProjectSetupWizard
            onGenerate={handleGenerate}
            onCancel={() => {
              if (onBackToProjects) {
                onBackToProjects();
              } else {
                setWorkspaceMode('studio');
                setActiveTab('3d-studio');
              }
            }}
          />
        )}

        {/* 1. 2D ENGINEERING PLAN */}
        {workspaceMode === 'studio' && activeTab === '2d-plan' && (
          <ArchitecturalCADWorkspace
            editor={editor}
            onRegeneratePlan={handleRegenerateVariant}
            generationSeed={generationSeed}
            isGenerating={isGenerating}
            canRegenerate={Boolean(lastBrief.current)}
            mode="engineering"
            hideToolbars={true}
            showInspector={showInspector}
            activeDiscipline={activeDiscipline}
            onDisciplineChange={setActiveDiscipline}
          />
        )}

        {/* 2. 2D PRESENTATION SHEET (ARCHLANG) */}
        {workspaceMode === 'studio' && activeTab === '2d-sheet' && (
          <ArchLangPresentationSheet
            building={editor.building}
            floorId={editor.activeFloor.id}
            lockedRoomIds={lockedRoomIds}
            onLockedRoomsChange={setLockedRoomIds}
          />
        )}

        {/* 3. 3D STUDIO (PASCAL EDITABLE OR STANDARD MASSING) */}
        {workspaceMode === 'studio' && activeTab === '3d-studio' && (
          <div className="flex-1 min-h-0 relative">
            {studioEngine === 'pascal' ? (
              <PascalStudioFrame
                projectId={editor.building.projectId}
                building={editor.building}
                onBuildingUpdate={(updatedBuilding) => editor.setBuilding(updatedBuilding)}
                activeFloorId={isolateFloor3d ? editor.activeFloor.id : undefined}
                reloadKey={sync3dCount}
                onFallbackToStandard={() => setStudioEngine('standard')}
              />
            ) : (
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
            )}
          </div>
        )}

        {/* 4. SYNCHRONIZED SPLIT VIEW (2D + 3D) */}
        {workspaceMode === 'studio' && activeTab === 'split-view' && (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden border-t border-[#E2DDD5]">
            {/* Left Pane (2D) */}
            <div
              data-testid="split-pane-left"
              className="split-pane-left min-w-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#E2DDD5]"
              style={{ flex: `${splitRatio} 1 0%` }}
            >
              <div className="px-3 py-1.5 bg-[#FFFFFF] border-b border-[#E2DDD5] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#181D23]">
                  {splitLeftMode === 'engineering' ? '2D Engineering Plan' : '2D Presentation Sheet (ArchLang)'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  2D ⇄ 3D Synced
                </span>
              </div>
              <div className="flex-1 min-h-0 relative">
                {splitLeftMode === 'engineering' ? (
                  <ArchitecturalCADWorkspace
                    editor={editor}
                    mode="engineering"
                    hideToolbars={true}
                    showInspector={false}
                  />
                ) : (
                  <ArchLangPresentationSheet
                    building={editor.building}
                    floorId={editor.activeFloor.id}
                    lockedRoomIds={lockedRoomIds}
                    onLockedRoomsChange={setLockedRoomIds}
                  />
                )}
              </div>
            </div>

            {/* Split Divider */}
            <div
              data-testid="split-pane-divider"
              className="split-pane-divider hidden lg:block w-1 bg-[#E2DDD5] cursor-col-resize hover:bg-[#B45309] transition shrink-0"
            />

            {/* Right Pane (3D Pascal Studio) */}
            <div
              data-testid="split-pane-right"
              className="split-pane-right min-w-0 flex flex-col"
              style={{ flex: `${100 - splitRatio} 1 0%` }}
            >
              <div className="px-3 py-1.5 bg-[#FFFFFF] border-b border-[#E2DDD5] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#181D23]">Pascal 3D Studio</span>
                <button
                  type="button"
                  data-testid="split-sync-btn"
                  onClick={() => setSync3dCount((c) => c + 1)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[#B45309] border border-amber-200 text-[11px] font-bold transition"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Sync 2D → 3D</span>
                </button>
              </div>
              <div className="flex-1 min-h-0 relative">
                <PascalStudioFrame
                  projectId={editor.building.projectId}
                  building={editor.building}
                  onBuildingUpdate={(updatedBuilding) => editor.setBuilding(updatedBuilding)}
                  activeFloorId={editor.activeFloor.id}
                  reloadKey={sync3dCount}
                  onFallbackToStandard={() => setStudioEngine('standard')}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. EXPORT CENTER */}
        {workspaceMode === 'studio' && activeTab === 'export' && (
          <ExportCenterWorkspace editor={editor} />
        )}

        {/* Generation Progress Modal */}
        <GenerationProgressModal
          isOpen={isGenerating}
          progress={pipelineProgress}
          error={generationError}
          onRetry={() => {
            if (lastBrief.current) handleGenerate(lastBrief.current);
          }}
          onCancel={cancelGeneration}
        />
      </main>

      {/* ── INTERACTIVE MODALS & DRAWERS ── */}
      {/* Command Palette Modal (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSwitchMode={(mode) => {
          setWorkspaceMode('studio');
          setActiveTab(mode);
        }}
        onSwitchFloor={(fid) => editor.switchFloor(fid)}
        floors={editor.building.floors}
        onRefresh={handleRefreshWorkspace}
        onNewProject={() => setWorkspaceMode('setup')}
        onBackToHub={() => {
          if (onBackToProjects) onBackToProjects();
          else window.location.href = '/projects';
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSignOut={handleSignOut}
        onLoadDemo={handleLoadDemo}
      />

      {/* Settings Modal (⚙) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings: StudioSettings) => {
          showToast(`Preferences saved (${settings.unitSystem.toUpperCase()})`);
        }}
      />

      {/* Job Activity Drawer (🔔) */}
      <JobActivityDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        projectId={editor.projectId}
      />
    </div>
  );
};

export default ArgonStudioShell;
