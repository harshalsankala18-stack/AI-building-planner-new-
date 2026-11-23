import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Server,
  Database,
  Cpu,
  Check,
  RefreshCw,
  HardDrive,
} from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: StudioSettings) => void;
}

export interface StudioSettings {
  unitSystem: 'metric' | 'imperial';
  gridSnap: boolean;
  showGrid: boolean;
  gridStepMeters: number;
  themeContrast: 'high' | 'normal';
}

const DEFAULT_SETTINGS: StudioSettings = {
  unitSystem: 'metric',
  gridSnap: true,
  showGrid: true,
  gridStepMeters: 0.5,
  themeContrast: 'normal',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const raw = localStorage.getItem('argon_studio_settings');
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [capabilities, setCapabilities] = useState<any>(null);
  const [loadingCaps, setLoadingCaps] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const fetchCapabilities = async () => {
    setLoadingCaps(true);
    try {
      const res = await fetch('/api/health/capabilities');
      if (res.ok) {
        const data = await res.json();
        setCapabilities(data);
      }
    } catch (err) {
      console.warn('Failed to load system capabilities:', err);
    } finally {
      setLoadingCaps(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchCapabilities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('argon_studio_settings', JSON.stringify(settings));
    onSave?.(settings);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="settings-modal"
      className="settings-modal fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#E2DDD5] bg-[#FFFFFF] shadow-2xl overflow-hidden text-[#181D23]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2DDD5] bg-[#F7F5F0]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-[#B45309]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#181D23]">Studio Settings</h3>
              <p className="text-[11px] text-[#5C6672]">Configure display units, snapping & platform topology</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#5C6672] hover:bg-slate-100 hover:text-[#181D23] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Unit System */}
          <div>
            <label className="block text-xs font-bold text-[#181D23] mb-2 uppercase tracking-wider">
              Display Unit System
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="unit-metric-btn"
                onClick={() => setSettings((s) => ({ ...s, unitSystem: 'metric' }))}
                className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                  settings.unitSystem === 'metric'
                    ? 'border-[#B45309] bg-amber-50/50 text-[#B45309] font-bold'
                    : 'border-[#E2DDD5] hover:bg-[#F7F5F0] text-[#181D23]'
                }`}
              >
                <div>
                  <div className="text-xs">Metric (m, mm, m²)</div>
                  <div className="text-[10px] text-[#5C6672] font-normal">SI units, standard architectural</div>
                </div>
                {settings.unitSystem === 'metric' && <Check className="h-4 w-4" />}
              </button>

              <button
                type="button"
                data-testid="unit-imperial-btn"
                onClick={() => setSettings((s) => ({ ...s, unitSystem: 'imperial' }))}
                className={`p-3 rounded-lg border text-left transition flex items-center justify-between ${
                  settings.unitSystem === 'imperial'
                    ? 'border-[#B45309] bg-amber-50/50 text-[#B45309] font-bold'
                    : 'border-[#E2DDD5] hover:bg-[#F7F5F0] text-[#181D23]'
                }`}
              >
                <div>
                  <div className="text-xs">Imperial (ft, in, sq ft)</div>
                  <div className="text-[10px] text-[#5C6672] font-normal">US architectural customary</div>
                </div>
                {settings.unitSystem === 'imperial' && <Check className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Grid & Snapping */}
          <div>
            <label className="block text-xs font-bold text-[#181D23] mb-2 uppercase tracking-wider">
              CAD Grid & Snapping
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0]/60 cursor-pointer">
                <span>Enable Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={settings.gridSnap}
                  onChange={(e) => setSettings((s) => ({ ...s, gridSnap: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#E2DDD5] text-[#B45309] focus:ring-[#B45309]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2DDD5] bg-[#F7F5F0]/60 cursor-pointer">
                <span>Show Reference Drafting Grid</span>
                <input
                  type="checkbox"
                  checked={settings.showGrid}
                  onChange={(e) => setSettings((s) => ({ ...s, showGrid: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#E2DDD5] text-[#B45309] focus:ring-[#B45309]"
                />
              </label>
            </div>
          </div>

          {/* System Topology (from capabilities) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#181D23] uppercase tracking-wider">
                System Topology & Capabilities
              </label>
              <button
                type="button"
                data-testid="recheck-health-btn"
                onClick={fetchCapabilities}
                disabled={loadingCaps}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#B45309] hover:underline"
              >
                <RefreshCw className={`h-3 w-3 ${loadingCaps ? 'animate-spin' : ''}`} />
                <span>Re-check Health</span>
              </button>
            </div>

            <div className="rounded-xl border border-[#E2DDD5] bg-[#F7F5F0] p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5C6672]">
                  <HardDrive className="h-4 w-4" />
                  <span>Object Storage:</span>
                </div>
                <span className="font-mono font-bold text-[#181D23]">
                  {capabilities?.storageProvider ? String(capabilities.storageProvider).toUpperCase() : 'LOCAL DISK'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5C6672]">
                  <Database className="h-4 w-4" />
                  <span>Database Repository:</span>
                </div>
                <span className="font-mono font-bold text-[#181D23]">
                  {capabilities?.databaseProvider ? String(capabilities.databaseProvider).toUpperCase() : 'LOCAL REPO'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5C6672]">
                  <Cpu className="h-4 w-4" />
                  <span>Worker Queue Mode:</span>
                </div>
                <span className="font-mono font-bold text-[#181D23]">
                  {capabilities?.queueMode ? String(capabilities.queueMode).toUpperCase() : 'IN-PROCESS LOCAL'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5C6672]">
                  <Server className="h-4 w-4" />
                  <span>Linux Worker Status:</span>
                </div>
                <span className="font-mono font-bold text-emerald-600">
                  {capabilities?.capabilities?.linuxAiWorker === 'local' ? 'ONLINE (LOCAL)' : 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#E2DDD5] bg-[#F7F5F0]">
          <span className="text-[11px] text-emerald-600 font-semibold">
            {savedToast ? '✓ Preferences saved successfully' : ''}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#E2DDD5] text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="save-settings-btn"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-bold shadow-2xs"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
