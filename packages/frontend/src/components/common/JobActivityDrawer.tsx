import React, { useState, useEffect } from 'react';
import { Bell, X, Trash2, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'job' | 'sync' | 'export' | 'save';
  title: string;
  detail?: string;
  timestamp: string;
  status: 'completed' | 'running' | 'failed';
  progress?: number;
}

export interface JobActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

const STORAGE_KEY = 'argon_activity_log';

export const activityLogger = {
  getLogs(): ActivityItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  add(item: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    try {
      const existing = this.getLogs();
      const newItem: ActivityItem = {
        ...item,
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      };
      const updated = [newItem, ...existing].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // silent
    }
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export const JobActivityDrawer: React.FC<JobActivityDrawerProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadActivities = () => {
    setIsRefreshing(true);
    try {
      const logs = activityLogger.getLogs();
      if (logs.length === 0) {
        // default items
        setActivities([
          {
            id: 'act_demo_1',
            type: 'sync',
            title: '2D ⇄ 3D Scene Synchronized',
            detail: 'All 5 levels and 1,303 nodes compiled',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            status: 'completed',
          },
          {
            id: 'act_demo_2',
            type: 'job',
            title: 'Compliance Audit Evaluated',
            detail: 'Score: 94 / 100 · 0 red conflicts',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            status: 'completed',
          },
        ]);
      } else {
        setActivities(logs);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleClear = () => {
    activityLogger.clear();
    setActivities([]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="job-activity-drawer"
      className="job-activity-drawer fixed inset-0 z-[990] flex justify-end bg-black/40 backdrop-blur-2xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full bg-[#FFFFFF] border-l border-[#E2DDD5] shadow-2xl flex flex-col text-[#181D23] animate-slideInRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E2DDD5] bg-[#F7F5F0]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#B45309]" />
            <h3 className="text-sm font-bold text-[#181D23]">Activity & Background Jobs</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="clear-activity-btn"
              onClick={handleClear}
              className="p-1 rounded text-[#5C6672] hover:text-rose-600 hover:bg-rose-50 transition"
              title="Clear activity log"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              data-testid="close-job-activity-drawer"
              onClick={onClose}
              className="p-1 rounded text-[#5C6672] hover:text-[#181D23] hover:bg-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-[#5C6672]">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <div className="text-xs font-semibold">No recent activity</div>
              <div className="text-[11px] mt-0.5">Background jobs and sync events will appear here</div>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="rounded-lg border border-[#E2DDD5] bg-[#F7F5F0] p-3 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {act.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : act.status === 'running' ? (
                      <RefreshCw className="h-4 w-4 text-sky-600 animate-spin shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-semibold text-[#181D23]">{act.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5C6672] shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {act.detail && <p className="text-[11px] text-[#5C6672] pl-6">{act.detail}</p>}

                {act.progress !== undefined && act.status === 'running' && (
                  <div className="w-full bg-[#E2DDD5] h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#B45309] h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, act.progress))}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F7F5F0] border-t border-[#E2DDD5] flex items-center justify-between text-[11px] text-[#5C6672]">
          <span>Logged {activities.length} items</span>
          <button
            type="button"
            onClick={loadActivities}
            className="flex items-center gap-1 text-[#B45309] font-semibold hover:underline"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
