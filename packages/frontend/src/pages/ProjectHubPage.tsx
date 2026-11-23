import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Calendar,
  Trash2,
  Copy,
  ExternalLink,
  Edit2,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { projectStorage, createCanonical30x50_2BHK } from '../services/storage';
import { authService, type AuthUser } from '../services/auth-service';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { SystemStatusIndicator } from '../components/common/SystemStatusIndicator';

export interface ProjectCardItem {
  id: string;
  name: string;
  updatedAt: string;
  roomCount: number;
  floorCount: number;
  plotWidth: number;
  plotDepth: number;
  complianceScore: number;
  category: string;
  flatCount: number;
}

export interface ProjectHubPageProps {
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onSignOut: () => void;
}

export const ProjectHubPage: React.FC<ProjectHubPageProps> = ({
  onOpenProject,
  onNewProject,
  onSignOut,
}) => {
  const [projects, setProjects] = useState<ProjectCardItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ProjectCardItem | null>(null);
  const [renameCandidate, setRenameCandidate] = useState<ProjectCardItem | null>(null);
  const [renameText, setRenameText] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const loadProjects = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch from local storage
      const localHeaders = projectStorage.list();

      // 2. Try fetching from backend /api/projects for parity
      let backendProjects: any[] = [];
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.projects)) {
            backendProjects = data.projects;
          }
        }
      } catch {
        // fallback to local
      }

      // Merge and deduplicate by ID strictly
      const map = new Map<string, ProjectCardItem>();

      // Put backend projects first
      for (const bp of backendProjects) {
        if (!bp.id) continue;
        map.set(bp.id, {
          id: bp.id,
          name: bp.name || 'Untitled Project',
          updatedAt: bp.updatedAt || new Date().toISOString(),
          roomCount: bp.roomCount || 5,
          floorCount: bp.floorCount || 1,
          plotWidth: bp.plotWidth || 30,
          plotDepth: bp.plotDepth || 50,
          complianceScore: bp.complianceScore || 94,
          category: bp.category || 'residential',
          flatCount: bp.flatCount || 1,
        });
      }

      // Merge local storage projects (updating or inserting)
      for (const lp of localHeaders) {
        if (!lp.id) continue;
        const existing = map.get(lp.id);
        map.set(lp.id, {
          id: lp.id,
          name: lp.name,
          updatedAt: lp.updatedAt,
          roomCount: lp.roomCount,
          floorCount: lp.floorCount,
          plotWidth: lp.plotWidth,
          plotDepth: lp.plotDepth,
          complianceScore: existing?.complianceScore ?? 94,
          category: lp.category ?? 'residential',
          flatCount: existing?.flatCount ?? 1,
        });
      }

      // If map is completely empty, provide canonical demo project
      if (map.size === 0) {
        map.set('proj-demo-canonical', {
          id: 'proj-demo-canonical',
          name: 'Demo Architectural Project (30x50 2BHK)',
          updatedAt: new Date().toISOString(),
          roomCount: 5,
          floorCount: 1,
          plotWidth: 9.144,
          plotDepth: 15.24,
          complianceScore: 94,
          category: 'residential',
          flatCount: 1,
        });
      }

      // Deduplicate: If multiple projects share the exact same title, keep only the canonical or newest one
      const titleMap = new Map<string, ProjectCardItem>();
      for (const item of Array.from(map.values())) {
        const normTitle = item.name.trim().toLowerCase();
        const existing = titleMap.get(normTitle);
        if (!existing || item.updatedAt > existing.updatedAt || item.id === 'proj-demo-canonical') {
          if (existing && existing.id !== item.id && existing.id.startsWith('proj_')) {
            projectStorage.delete(existing.id);
          }
          titleMap.set(normTitle, item);
        } else if (item.id.startsWith('proj_')) {
          projectStorage.delete(item.id);
        }
      }

      const list = Array.from(titleMap.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      setProjects(list);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadProjects();
    const unsub = authService.subscribe((s) => setUser(s?.user ?? null));
    return unsub;
  }, []);

  const handleLoadDemo = () => {
    const demoId = 'proj-demo-canonical';
    // Ensure demo building is saved locally without duplicates
    const existing = projectStorage.load(demoId);
    if (!existing) {
      const demoBuilding = createCanonical30x50_2BHK('Demo Architectural Project (30x50 2BHK)', demoId);
      projectStorage.save({
        schemaVersion: 1,
        projectId: demoId,
        name: demoBuilding.name,
        createdAt: demoBuilding.createdAt,
        updatedAt: demoBuilding.updatedAt,
        building: demoBuilding,
        category: 'residential',
        status: 'CONCEPT',
      });
    }
    projectStorage.setActiveProjectId(demoId);
    showToast('Loaded Demo Architectural Project');
    onOpenProject(demoId);
  };

  const handleDuplicate = (project: ProjectCardItem) => {
    const loaded = projectStorage.load(project.id);
    if (!loaded) {
      showToast('Project details not available to duplicate');
      return;
    }
    const newId = `proj_${Date.now()}`;
    const newName = `${project.name} (Copy)`;
    const newBuilding = {
      ...loaded.building,
      projectId: newId,
      name: newName,
      updatedAt: new Date().toISOString(),
    };
    projectStorage.save({
      ...loaded,
      projectId: newId,
      name: newName,
      updatedAt: new Date().toISOString(),
      building: newBuilding,
    });
    showToast(`Duplicated: ${newName}`);
    void loadProjects();
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const pid = deleteCandidate.id;
    projectStorage.delete(pid);
    try {
      await fetch(`/api/projects/${encodeURIComponent(pid)}`, { method: 'DELETE' });
    } catch {
      // offline silent
    }
    setDeleteCandidate(null);
    showToast(`Deleted ${deleteCandidate.name}`);
    void loadProjects();
  };

  const handleRename = () => {
    if (!renameCandidate || !renameText.trim()) return;
    const loaded = projectStorage.load(renameCandidate.id);
    if (loaded) {
      projectStorage.save({
        ...loaded,
        name: renameText.trim(),
        updatedAt: new Date().toISOString(),
        building: {
          ...loaded.building,
          name: renameText.trim(),
        },
      });
    }
    setRenameCandidate(null);
    setRenameText('');
    showToast('Project renamed');
    void loadProjects();
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="project-hub-page min-h-screen w-screen bg-[#F7F5F0] text-[#181D23] flex flex-col font-sans">
      {/* Toast Alert */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-lg border border-[#B45309]/30 bg-[#FFFFFF] px-4 py-2.5 text-xs font-semibold text-[#181D23] shadow-xl animate-fadeIn flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#B45309]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 52px FIXED GLOBAL HUB HEADER */}
      <header className="h-[52px] max-h-[52px] bg-[#FFFFFF] border-b border-[#E2DDD5] px-6 flex items-center justify-between z-40 shrink-0 shadow-2xs select-none">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B45309] text-white shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black tracking-tight text-[#181D23] uppercase italic">
              ARGON<span className="text-[#B45309]">4</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#5C6672] uppercase hidden sm:inline">
              Project Hub
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6672]" />
            <input
              type="text"
              data-testid="hub-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name or category..."
              className="w-full h-8 pl-9 pr-4 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] text-xs text-[#181D23] placeholder-[#5C6672] focus:bg-[#FFFFFF] focus:border-[#B45309] focus:outline-none transition"
            />
          </div>
        </div>

        {/* Right: Actions, Status & User Menu */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="hub-refresh-btn"
            onClick={loadProjects}
            className="p-1.5 rounded-lg text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition"
            title="Refresh Projects List"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#B45309]' : ''}`} />
          </button>

          <SystemStatusIndicator />

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              data-testid="hub-user-menu-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-[#F7F5F0] transition border border-transparent hover:border-[#E2DDD5]"
            >
              <div className="h-6 w-6 rounded-full bg-[#B45309] text-white flex items-center justify-center text-[11px] font-bold">
                {user?.name ? user.name[0]?.toUpperCase() : 'A'}
              </div>
              <span className="text-xs font-semibold text-[#181D23] hidden md:inline">
                {user?.email || 'demo@argon4.studio'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#5C6672]" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] shadow-xl z-50 py-1.5 animate-fadeIn">
                <div className="px-3 py-2 border-b border-[#E2DDD5] text-xs">
                  <div className="font-bold text-[#181D23]">{user?.name || 'Lead Architect'}</div>
                  <div className="text-[11px] text-[#5C6672] truncate">{user?.email || 'demo@argon4.studio'}</div>
                  <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-amber-50 text-[#B45309] px-1.5 py-0.5 rounded">
                    {user?.role || 'Principal Architect'}
                  </span>
                </div>

                <button
                  type="button"
                  data-testid="hub-signout-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SUB-HEADER / ACTION BAR */}
      <div className="bg-[#FFFFFF] border-b border-[#E2DDD5] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#181D23]">Architectural Projects</h1>
            <p className="text-xs text-[#5C6672] mt-0.5">
              Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} in workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="hub-load-demo-btn"
              onClick={handleLoadDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E2DDD5] bg-[#FFFFFF] hover:bg-[#F7F5F0] text-xs font-semibold text-[#181D23] transition shadow-2xs"
            >
              <Sparkles className="h-4 w-4 text-[#B45309]" />
              <span>Load Demo Project</span>
            </button>

            <button
              type="button"
              data-testid="hub-new-project-btn"
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>+ New Building Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN PROJECT CARDS GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#E2DDD5] rounded-2xl bg-[#FFFFFF] mt-6">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-[#B45309] flex items-center justify-center mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#181D23]">No projects found</h3>
            <p className="text-xs text-[#5C6672] max-w-sm mt-1 mb-6">
              {searchQuery
                ? `No projects matched "${searchQuery}". Try clearing your search.`
                : 'Get started by creating a new building project or loading the verified demo project.'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-4 py-2 rounded-lg border border-[#E2DDD5] bg-[#FFFFFF] hover:bg-[#F7F5F0] text-xs font-semibold text-[#181D23]"
              >
                Load Demo Project
              </button>
              <button
                type="button"
                onClick={onNewProject}
                className="px-4 py-2 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold"
              >
                + New Building Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                data-testid={`project-card-${p.id}`}
                className="project-card rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                {/* Top Blueprint Preview Thumbnail */}
                <div>
                  <div className="h-28 w-full rounded-lg bg-[#0F141B] p-3 mb-4 flex flex-col justify-between relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                    <div className="flex items-center justify-between relative z-10 text-[10px] font-mono text-slate-400">
                      <span>PLOT {Math.round(p.plotWidth)}m × {Math.round(p.plotDepth)}m</span>
                      <span className="text-amber-400 font-bold">{p.floorCount} FLOORS</span>
                    </div>
                    {/* Architectural Floor Wireframe Icon */}
                    <div className="flex items-center justify-center relative z-10 text-slate-500 group-hover:text-amber-400 transition">
                      <Layers className="h-10 w-10 stroke-[1.2]" />
                    </div>
                    <div className="flex items-center justify-between relative z-10 text-[10px] font-mono text-slate-400">
                      <span>{p.roomCount} ROOMS</span>
                      <span className="text-emerald-400 font-bold">2D/3D SYNCED</span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-sm text-[#181D23] line-clamp-1 group-hover:text-[#B45309] transition">
                      {p.name}
                    </h3>
                    <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{p.complianceScore}/100</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5C6672] mb-4 font-mono">
                    <div>Floors: <span className="font-bold text-[#181D23]">{p.floorCount}</span></div>
                    <div>Flats: <span className="font-bold text-[#181D23]">{p.flatCount}</span></div>
                    <div>Rooms: <span className="font-bold text-[#181D23]">{p.roomCount}</span></div>
                    <div>Typology: <span className="font-bold text-[#181D23] uppercase">{p.category}</span></div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="border-t border-[#E2DDD5] pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-[#5C6672] font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameCandidate(p);
                        setRenameText(p.name);
                      }}
                      className="p-1.5 rounded text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition"
                      title="Rename Project"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(p)}
                      className="p-1.5 rounded text-[#5C6672] hover:text-[#181D23] hover:bg-[#F7F5F0] transition"
                      title="Duplicate Project"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(p)}
                      className="p-1.5 rounded text-[#5C6672] hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      data-testid={`open-studio-btn-${p.id}`}
                      onClick={() => {
                        projectStorage.setActiveProjectId(p.id);
                        onOpenProject(p.id);
                      }}
                      className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold transition shadow-2xs"
                    >
                      <span>Open in Studio</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Architectural Project"
        message={`Are you sure you want to delete "${deleteCandidate?.name}"? This action permanently removes canonical geometry and Pascal 3D scenes.`}
        confirmLabel="Delete Project"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Rename Modal */}
      {renameCandidate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
        >
          <div className="w-full max-w-sm rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] p-6 shadow-2xl text-[#181D23]">
            <h3 className="text-base font-bold text-[#181D23] mb-3">Rename Project</h3>
            <input
              type="text"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] text-xs font-semibold focus:outline-none focus:border-[#B45309] focus:bg-[#FFFFFF] mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenameCandidate(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E2DDD5] text-xs font-semibold hover:bg-[#F7F5F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRename}
                className="px-4 py-1.5 rounded-lg bg-[#B45309] text-white text-xs font-bold hover:bg-[#92400E]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
