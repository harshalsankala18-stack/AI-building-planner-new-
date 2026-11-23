import React, { useState, useEffect } from 'react';
import {
  Search,
  DraftingCompass,
  Layers,
  Box,
  Split,
  Download,
  FolderOpen,
  Plus,
  Settings,
  LogOut,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: (mode: '2d-plan' | '2d-sheet' | '3d-studio' | 'split-view' | 'export') => void;
  onSwitchFloor: (floorId: string) => void;
  floors: readonly { id: string; name: string }[];
  onRefresh: () => void;
  onNewProject: () => void;
  onBackToHub: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  onLoadDemo: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSwitchMode,
  onSwitchFloor,
  floors,
  onRefresh,
  onNewProject,
  onBackToHub,
  onOpenSettings,
  onSignOut,
  onLoadDemo,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allCommands = [
    {
      id: 'mode-2d-plan',
      title: 'Switch to 2D Engineering Plan',
      category: 'Navigation',
      icon: <DraftingCompass className="h-4 w-4 text-[#B45309]" />,
      action: () => {
        onSwitchMode('2d-plan');
        onClose();
      },
    },
    {
      id: 'mode-2d-sheet',
      title: 'Switch to 2D Presentation Sheet (ArchLang)',
      category: 'Navigation',
      icon: <Layers className="h-4 w-4 text-emerald-600" />,
      action: () => {
        onSwitchMode('2d-sheet');
        onClose();
      },
    },
    {
      id: 'mode-3d-studio',
      title: 'Switch to Pascal 3D Studio',
      category: 'Navigation',
      icon: <Box className="h-4 w-4 text-sky-600" />,
      action: () => {
        onSwitchMode('3d-studio');
        onClose();
      },
    },
    {
      id: 'mode-split-view',
      title: 'Switch to Synchronized Split View (2D + 3D)',
      category: 'Navigation',
      icon: <Split className="h-4 w-4 text-indigo-600" />,
      action: () => {
        onSwitchMode('split-view');
        onClose();
      },
    },
    {
      id: 'mode-export',
      title: 'Open Export Center & Engineering Deliverables',
      category: 'Navigation',
      icon: <Download className="h-4 w-4 text-amber-600" />,
      action: () => {
        onSwitchMode('export');
        onClose();
      },
    },
    ...floors.map((f) => ({
      id: `floor-${f.id}`,
      title: `Switch Floor: ${f.name}`,
      category: 'Floors',
      icon: <Layers className="h-4 w-4 text-[#5C6672]" />,
      action: () => {
        onSwitchFloor(f.id);
        onClose();
      },
    })),
    {
      id: 'act-refresh',
      title: 'Refresh Workspace & Re-evaluate Compliance',
      category: 'Workspace',
      icon: <RefreshCw className="h-4 w-4 text-[#5C6672]" />,
      action: () => {
        onRefresh();
        onClose();
      },
    },
    {
      id: 'act-hub',
      title: 'Back to Project Hub',
      category: 'Projects',
      icon: <FolderOpen className="h-4 w-4 text-[#5C6672]" />,
      action: () => {
        onBackToHub();
        onClose();
      },
    },
    {
      id: 'act-new-proj',
      title: 'Create New Building Project',
      category: 'Projects',
      icon: <Plus className="h-4 w-4 text-[#B45309]" />,
      action: () => {
        onNewProject();
        onClose();
      },
    },
    {
      id: 'act-demo',
      title: 'Load Demo Architectural Project (30x50 2BHK)',
      category: 'Projects',
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      action: () => {
        onLoadDemo();
        onClose();
      },
    },
    {
      id: 'act-settings',
      title: 'Open Studio Settings & System Health',
      category: 'Preferences',
      icon: <Settings className="h-4 w-4 text-[#5C6672]" />,
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
    {
      id: 'act-signout',
      title: 'Sign Out of Studio',
      category: 'Account',
      icon: <LogOut className="h-4 w-4 text-rose-600" />,
      action: () => {
        onSignOut();
        onClose();
      },
    },
  ];

  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="command-palette-modal"
      className="command-palette-modal fixed inset-0 z-[999] flex items-start justify-center pt-24 bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] shadow-2xl overflow-hidden text-[#181D23]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2DDD5] bg-[#F7F5F0]">
          <Search className="h-4 w-4 text-[#5C6672]" />
          <input
            type="text"
            data-testid="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search workspace actions..."
            className="w-full bg-transparent text-xs text-[#181D23] placeholder-[#5C6672] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#5C6672] hover:text-[#181D23]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5C6672]">No commands found for "{query}"</div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition ${
                  idx === selectedIndex
                    ? 'bg-amber-50 text-[#B45309] font-semibold border border-amber-200'
                    : 'text-[#181D23] hover:bg-[#F7F5F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {cmd.icon}
                  <span>{cmd.title}</span>
                </div>
                <span className="text-[10px] font-mono text-[#5C6672] uppercase tracking-wider">
                  {cmd.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-[#F7F5F0] border-t border-[#E2DDD5] text-[10px] text-[#5C6672] font-mono">
          <span>Use ↑ ↓ to navigate</span>
          <span>↵ Enter to select · Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
