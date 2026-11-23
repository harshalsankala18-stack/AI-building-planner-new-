import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  DraftingCompass,
  Layers,
  Box,
  Split,
  Download,
  FolderOpen,
  Plus,
  Check,
  RefreshCw,
  Command,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { type AuthUser } from '../../services/auth-service';

export type StudioTabId = '2d-plan' | '2d-sheet' | '3d-studio' | 'split-view' | 'export';

export interface StudioTopBarProps {
  projectName: string;
  projectId: string;
  projectList: Array<{ id: string; name: string; floorCount?: number; roomCount?: number }>;
  onSelectProject: (projectId: string) => void;
  onBackToHub: () => void;
  onNewProject: () => void;
  activeTab: StudioTabId;
  onTabChange: (tab: StudioTabId) => void;
  showTabs?: boolean;
  complianceScore: number;
  syncStatus?: 'synced' | 'syncing' | 'unsaved';
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  user: AuthUser | null;
  onSignOut: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  projectName,
  projectId,
  projectList,
  onSelectProject,
  onBackToHub,
  onNewProject,
  activeTab,
  onTabChange,
  showTabs = true,
  complianceScore,
  syncStatus = 'synced',
  isRefreshing = false,
  onRefresh,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenSettings,
  user,
  onSignOut,
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Strict deduplication of projects by ID
  const uniqueProjects = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; floorCount?: number; roomCount?: number }>();
    for (const p of projectList) {
      if (!p.id) continue;
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [projectList]);

  return (
    <header
      data-testid="studio-topbar"
      className="studio-top-bar argon-topbar h-[52px] max-h-[52px] bg-[#FFFFFF] border-b border-[#E2DDD5] flex items-center justify-between px-3 md:px-4 z-50 shrink-0 shadow-2xs select-none whitespace-nowrap overflow-hidden"
    >
      {/* ── LEFT ZONE: BRAND & DEDUPLICATED PROJECT SWITCHER ── */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onBackToHub}
          className="flex items-center gap-2 group hover:opacity-90 transition cursor-pointer"
          title="Back to Project Hub"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B45309] text-white shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-black text-base tracking-tighter uppercase italic text-[#181D23]">
            ARGON<span className="text-[#B45309]">4</span>
          </span>
        </button>

        <div className="h-4 w-px bg-[#E2DDD5]" />

        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            data-testid="project-switcher-btn"
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] transition text-left cursor-pointer max-w-[200px]"
          >
            <FolderOpen className="h-3.5 w-3.5 text-[#5C6672] shrink-0" />
            <div className="truncate">
              <div className="text-[9px] font-mono font-bold text-[#5C6672] uppercase leading-none">
                PROJECT
              </div>
              <div className="text-xs font-bold text-[#181D23] truncate leading-tight mt-0.5">
                {projectName || 'Untitled'}
              </div>
            </div>
            <ChevronDown className={`h-3 w-3 text-[#5C6672] shrink-0 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] shadow-2xl z-[100] py-1.5 animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#E2DDD5] flex items-center justify-between bg-[#F7F5F0]">
                <span className="text-[10px] font-mono font-bold text-[#5C6672] uppercase tracking-wider">
                  Switch Project
                </span>
                <button
                  type="button"
                  data-testid="switcher-new-project-btn"
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onNewProject();
                  }}
                  className="text-[10px] font-bold text-[#B45309] hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> NEW
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5">
                {uniqueProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition mb-0.5 ${
                      p.id === projectId
                        ? 'bg-amber-50 text-[#B45309] font-bold border border-amber-200'
                        : 'text-[#181D23] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{p.name}</div>
                      {p.floorCount !== undefined && (
                        <div className="text-[9px] text-[#5C6672] font-mono">
                          {p.floorCount} FLOORS · {p.roomCount ?? 0} ROOMS
                        </div>
                      )}
                    </div>
                    {p.id === projectId && <Check className="h-3.5 w-3.5 text-[#B45309] shrink-0" />}
                  </button>
                ))}
              </div>

              <button
                type="button"
                data-testid="switcher-back-hub-btn"
                onClick={() => {
                  setIsProjectDropdownOpen(false);
                  onBackToHub();
                }}
                className="w-full py-2 text-center text-[11px] font-bold text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] border-t border-[#E2DDD5] transition"
              >
                ← Back to Project Hub
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER ZONE: ONE SEGMENTED 5-TAB SWITCHER ── */}
      {showTabs ? (
        <nav
          aria-label="Studio View Modes"
          data-testid="studio-mode-tabs"
          className="studio-tabs flex items-center bg-[#F7F5F0] p-0.5 rounded-lg border border-[#E2DDD5] shrink-0"
        >
          <button
            type="button"
            data-tab="2d-plan"
            data-testid="tab-2d-plan"
            onClick={() => onTabChange('2d-plan')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === '2d-plan'
                ? 'bg-[#FFFFFF] text-[#B45309] shadow-xs font-bold'
                : 'text-[#5C6672] hover:text-[#181D23]'
            }`}
          >
            <DraftingCompass className="h-3.5 w-3.5" />
            <span>2D Plan</span>
          </button>

          <button
            type="button"
            data-tab="2d-sheet"
            data-testid="tab-2d-sheet"
            onClick={() => onTabChange('2d-sheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === '2d-sheet'
                ? 'bg-[#FFFFFF] text-[#B45309] shadow-xs font-bold'
                : 'text-[#5C6672] hover:text-[#181D23]'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>2D Sheet</span>
          </button>

          <button
            type="button"
            data-tab="3d-studio"
            data-testid="tab-3d-studio"
            onClick={() => onTabChange('3d-studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === '3d-studio'
                ? 'bg-[#FFFFFF] text-[#B45309] shadow-xs font-bold'
                : 'text-[#5C6672] hover:text-[#181D23]'
            }`}
          >
            <Box className="h-3.5 w-3.5 text-sky-600" />
            <span>3D Studio</span>
          </button>

          <button
            type="button"
            data-tab="split-view"
            data-testid="tab-split-view"
            onClick={() => onTabChange('split-view')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'split-view'
                ? 'bg-[#FFFFFF] text-[#B45309] shadow-xs font-bold'
                : 'text-[#5C6672] hover:text-[#181D23]'
            }`}
          >
            <Split className="h-3.5 w-3.5 text-indigo-600" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            data-tab="export"
            data-testid="tab-export"
            onClick={() => onTabChange('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'export'
                ? 'bg-[#FFFFFF] text-[#B45309] shadow-xs font-bold'
                : 'text-[#5C6672] hover:text-[#181D23]'
            }`}
          >
            <Download className="h-3.5 w-3.5 text-amber-600" />
            <span>Export Center</span>
          </button>
        </nav>
      ) : (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5C6672]">
          <span className="text-[#181D23] font-bold">Project Intake Wizard</span>
          <span>•</span>
          <span>Stage 01 to 04</span>
        </div>
      )}

      {/* ── RIGHT ZONE: COMPLIANCE, SYNC & STUDIO ACTIONS ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Compliance Score Pill (ONLY ONCE ON THE WHOLE PAGE) */}
        <div
          data-testid="topbar-compliance-pill"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs"
          title="Architectural & UDCPR / NBC Code Compliance"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{complianceScore}/100</span>
        </div>

        {/* 2D ⇄ 3D Live Sync Status */}
        <div
          data-testid="topbar-sync-status"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E2DDD5] bg-[#F7F5F0] text-[11px] font-mono text-[#5C6672]"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              syncStatus === 'synced'
                ? 'bg-emerald-500'
                : syncStatus === 'syncing'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-sky-500'
            }`}
          />
          <span>{syncStatus === 'synced' ? '2D ⇄ 3D Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Modified'}</span>
        </div>

        <div className="h-4 w-px bg-[#E2DDD5]" />

        {/* Refresh Button */}
        <button
          type="button"
          data-testid="topbar-refresh-btn"
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition"
          title="Refresh Workspace & Sync"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#B45309]' : ''}`} />
        </button>

        {/* Command Palette Button */}
        <button
          type="button"
          data-testid="topbar-command-palette-btn"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] hover:bg-[#FFFFFF] text-[#5C6672] hover:text-[#181D23] transition text-[11px] font-mono"
          title="Quick Commands (⌘K)"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">⌘K</span>
        </button>

        {/* Notifications / Jobs Bell */}
        <button
          type="button"
          data-testid="topbar-notifications-btn"
          onClick={onOpenNotifications}
          className="p-1.5 rounded-lg text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition relative"
          title="Background Jobs & Activity Log"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#B45309]" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          data-testid="topbar-settings-btn"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition"
          title="Studio Preferences & Topology"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            data-testid="topbar-user-avatar-btn"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#F7F5F0] transition"
          >
            <div className="h-6 w-6 rounded-full bg-[#B45309] text-white flex items-center justify-center text-[11px] font-bold">
              {user?.name ? user.name[0]?.toUpperCase() : 'A'}
            </div>
            <ChevronDown className="h-3 w-3 text-[#5C6672]" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] shadow-2xl z-[100] py-1.5 animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#E2DDD5] text-xs">
                <div className="font-bold text-[#181D23]">{user?.name || 'Lead Architect'}</div>
                <div className="text-[11px] text-[#5C6672] truncate">{user?.email || 'demo@argon4.studio'}</div>
                <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-amber-50 text-[#B45309] px-1.5 py-0.5 rounded">
                  {user?.role || 'Principal Architect'}
                </span>
              </div>

              <button
                type="button"
                data-testid="user-dropdown-hub-btn"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  onBackToHub();
                }}
                className="w-full px-3 py-2 text-left text-xs text-[#181D23] hover:bg-[#F7F5F0] flex items-center gap-2 font-medium transition"
              >
                <FolderOpen className="h-3.5 w-3.5 text-[#5C6672]" />
                <span>Project Hub</span>
              </button>

              <button
                type="button"
                data-testid="user-dropdown-signout-btn"
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  onSignOut();
                }}
                className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition border-t border-[#E2DDD5]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
