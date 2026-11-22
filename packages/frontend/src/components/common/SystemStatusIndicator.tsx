import React, { useState } from 'react';
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useSystemCapabilities } from '../../services/useSystemCapabilities';

export const SystemStatusIndicator: React.FC = () => {
  const { capabilities, loading, error, refresh } = useSystemCapabilities(30000);
  const [isOpen, setIsOpen] = useState(false);

  if (loading && !capabilities) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 text-xs border border-slate-700/60 animate-pulse">
        <Server className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Checking status...</span>
      </div>
    );
  }

  const isCloudStorage = capabilities?.storageProvider === 'cloudflare-r2';
  const isCloudDb = capabilities?.databaseProvider === 'supabase-postgres';
  const isRedisQueue = capabilities?.queueMode === 'bullmq-redis';
  const windowsCadStatus = capabilities?.capabilities.windowsCadRunner ?? 'unavailable';

  const isFullyDistributed = isCloudStorage && isCloudDb && isRedisQueue;
  const statusColor = error
    ? 'bg-red-500'
    : isFullyDistributed
    ? 'bg-emerald-500'
    : 'bg-sky-500';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-200 transition-all shadow-sm"
        title="View System & Worker Topology"
      >
        <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
        <span className="hidden md:inline font-medium text-[11px]">
          {isFullyDistributed
            ? 'Cloud Production'
            : isRedisQueue
            ? 'Hybrid Cluster'
            : 'Local Fast Dev'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-4 text-xs text-slate-200 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <strong className="text-sm text-slate-100">System Topology</strong>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
              >
                Refresh
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {/* Storage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Object Storage</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isCloudStorage
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isCloudStorage ? 'Cloudflare R2' : 'Local Disk'}
                </span>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Repository DB</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isCloudDb
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isCloudDb ? 'Supabase Postgres' : 'Local JSON'}
                </span>
              </div>

              {/* Queue Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Async Job Queue</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isRedisQueue
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isRedisQueue ? 'BullMQ (Redis)' : 'In-Process Local'}
                </span>
              </div>

              {/* Workers Divider */}
              <div className="pt-2 border-t border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Compute Workers
              </div>

              {/* Linux AI Worker */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>AI & ArchLang Worker</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Ready (Linux/Native)
                </span>
              </div>

              {/* Windows AutoCAD Worker */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>AutoCAD Native Runner</span>
                </div>
                <span
                  className={`flex items-center gap-1 text-[10px] ${
                    windowsCadStatus === 'local'
                      ? 'text-emerald-400'
                      : windowsCadStatus === 'queued_remote'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {windowsCadStatus === 'local' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Local Host
                    </>
                  ) : windowsCadStatus === 'queued_remote' ? (
                    <>
                      <Layers className="w-3 h-3" /> Queued (Redis)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Unconfigured
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400">
              Role: <span className="text-slate-300 font-mono">{capabilities?.workerRole ?? 'all'}</span>
              {' · '}Deterministic engine active with 100% offline fallback.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
