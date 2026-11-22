import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Download,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
} from 'lucide-react';

export interface TrackedJob {
  id: string;
  jobType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  queueName?: string;
  createdAt: number;
  result?: {
    artifacts?: Array<{
      fileName: string;
      downloadUrl?: string;
      storageKey?: string;
      sizeBytes?: number;
    }>;
    downloadUrl?: string;
    storageKey?: string;
    message?: string;
  };
  error?: string;
}

type JobListener = (jobs: TrackedJob[]) => void;

class JobTrackerStore {
  private jobs: TrackedJob[] = [];
  private listeners: Set<JobListener> = new Set();
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPolling();
  }

  public subscribe(listener: JobListener): () => void {
    this.listeners.add(listener);
    listener([...this.jobs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getJobs(): TrackedJob[] {
    return [...this.jobs];
  }

  public addJob(id: string, jobType: string, queueName?: string): void {
    const existing = this.jobs.find((j) => j.id === id);
    if (!existing) {
      this.jobs.unshift({
        id,
        jobType,
        status: 'pending',
        progress: 0,
        queueName,
        createdAt: Date.now(),
      });
      this.notify();
    }
  }

  public removeJob(id: string): void {
    this.jobs = this.jobs.filter((j) => j.id !== id);
    this.notify();
  }

  private notify(): void {
    const copy = [...this.jobs];
    for (const l of this.listeners) {
      l(copy);
    }
  }

  private startPolling(): void {
    if (typeof window === 'undefined') return;
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(async () => {
      const activeJobs = this.jobs.filter(
        (j) => j.status === 'pending' || j.status === 'processing'
      );
      if (activeJobs.length === 0) return;

      let changed = false;
      for (const job of activeJobs) {
        try {
          const res = await fetch(`/api/jobs/${encodeURIComponent(job.id)}`);
          if (res.ok) {
            const data = await res.json();
            if (
              job.status !== data.status ||
              job.progress !== data.progress ||
              data.result ||
              data.error
            ) {
              job.status = data.status;
              job.progress = data.progress ?? job.progress;
              job.result = data.result ?? job.result;
              job.error = data.error ?? job.error;
              job.queueName = data.queueName ?? job.queueName;
              changed = true;
            }
          }
        } catch {
          // ignore transient poll error
        }
      }

      if (changed) {
        this.notify();
      }
    }, 2500);
  }
}

export const jobTrackerService = new JobTrackerStore();

export const JobTracker: React.FC = () => {
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return jobTrackerService.subscribe(setJobs);
  }, []);

  const activeCount = jobs.filter(
    (j) => j.status === 'pending' || j.status === 'processing'
  ).length;

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Floating Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-sky-500/40 bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-xl backdrop-blur-md hover:bg-slate-800 transition"
      >
        {activeCount > 0 ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span>Background Jobs ({jobs.length})</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] text-sky-300">
            {activeCount} running
          </span>
        )}
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Expanded Drawer */}
      {isOpen && (
        <div className="mt-2 w-96 max-h-[26rem] overflow-hidden rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <strong className="text-xs text-slate-100">Job Execution Monitor</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {jobs.map((job) => {
              const isRunning = job.status === 'pending' || job.status === 'processing';
              const isDone = job.status === 'completed';
              const isFailed = job.status === 'failed';

              return (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 capitalize">
                      {job.jobType.replace(/[-_]/g, ' ')}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isFailed
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800 animate-pulse'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Queue: {job.queueName ?? 'ai-and-light-exports'}</span>
                    <span className="font-mono">{job.id.slice(0, 8)}...</span>
                  </div>

                  {isRunning && typeof job.progress === 'number' && (
                    <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, job.progress)}%` }}
                      />
                    </div>
                  )}

                  {isFailed && job.error && (
                    <div className="mt-1.5 text-[11px] text-red-300 bg-red-950/50 p-1.5 rounded border border-red-900/50">
                      {job.error}
                    </div>
                  )}

                  {isDone && job.result && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {job.result.downloadUrl ? (
                        <a
                          href={job.result.downloadUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white transition shadow-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Output</span>
                        </a>
                      ) : job.result.storageKey ? (
                        <a
                          href={`/api/storage/download?key=${encodeURIComponent(
                            job.result.storageKey
                          )}`}
                          download
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white transition shadow-xs"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Artifact</span>
                        </a>
                      ) : null}

                      {job.result.artifacts &&
                        job.result.artifacts.map((art, idx) => (
                          <a
                            key={idx}
                            href={
                              art.downloadUrl ||
                              (art.storageKey
                                ? `/api/storage/download?key=${encodeURIComponent(art.storageKey)}`
                                : '#')
                            }
                            download={art.fileName}
                            className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-200 border border-slate-700"
                          >
                            <Download className="w-2.5 h-2.5 text-slate-400" />
                            <span>{art.fileName}</span>
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
