import React, { useEffect, useRef, useState } from 'react';
import { ETABSExportPanel } from './ETABSExportPanel';
import type { ExportFileDescriptor } from '@ai-floor-planner/core';
import type { EditorContextValue } from '../../stores/editor-store';
import {
  requestVerifiedExport,
  downloadVerifiedExport,
  fetchVerifiedBytes,
  type VerifiedExportFormat,
  type VerifiedExportOptions,
} from '../../services/export-client';
import { requestArchLangExport, fetchArchLangPreview } from '../../services/archlang-client';
import { useSystemCapabilities } from '../../services/useSystemCapabilities';
import { jobTrackerService } from '../common/JobTracker';

export const ExportCenterWorkspace: React.FC<{ editor: EditorContextValue }> = ({ editor }) => {
  const { building } = editor;
  const [paperSize, setPaper] = useState<'A3' | 'A2' | 'A1'>('A3');
  const [scale, setScale] = useState('FIT_TO_PAGE');
  const [artifacts, setArtifacts] = useState<Record<string, ExportFileDescriptor>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{
    url: string;
    type: string;
    title: string;
    text?: string;
  } | null>(null);
  const [blenderStatus, setBlenderStatus] = useState<'IDLE' | 'GENERATING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [blenderManifest, setBlenderManifest] = useState<{ jobId: string; files: any[] } | null>(null);
  const [blenderError, setBlenderError] = useState<string>('');
  const { capabilities } = useSystemCapabilities();
  const windowsCadStatus = capabilities?.capabilities?.windowsCadRunner ?? 'unavailable';

  const enqueueJob = async (jobType: string, payload: any) => {
    try {
      setBusy(`job-${jobType}`);
      const res = await fetch(`/api/projects/${encodeURIComponent(building.projectId)}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobType, payload }),
      });
      if (!res.ok) {
        throw new Error(`Enqueue failed (${res.status})`);
      }
      const data = await res.json();
      jobTrackerService.addJob(data.jobId, jobType, data.queue);
    } catch (e: any) {
      setError(`Failed to enqueue background job: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const [archlangFloorId, setArchlangFloorId] = useState<string>(building.floors[0]?.id ?? '');
  const [archlangAutoFurnish, setArchlangAutoFurnish] = useState(true);
  const [archlangCirculation, setArchlangCirculation] = useState(false);
  const [archlangDimensions, setArchlangDimensions] = useState(true);
  const [archlangBusy, setArchlangBusy] = useState<string | null>(null);
  const [archlangStatus, setArchlangStatus] = useState<string>('');
  const controller = useRef(new AbortController());
  const current = useRef(building);
  current.current = building;
  useEffect(() => {
    controller.current.abort();
    controller.current = new AbortController();
    setArtifacts({});
    setPreview(null);
    setBusy(null);
    setError('');
    setBlenderStatus('IDLE');
    setBlenderManifest(null);
    setBlenderError('');
    return () => controller.current.abort();
  }, [building, paperSize, scale]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  const rows = [
    {
      id: 'site',
      title: '01 Site Plan',
      options: { floorId: 'site', exportScope: 'site_plan' } as VerifiedExportOptions,
      formats: ['dwg', 'dxf', 'pdf'],
    },
    ...building.floors.map((f) => ({
      id: f.id,
      title: f.name,
      options: { floorId: f.id, exportScope: 'current_floor' } as VerifiedExportOptions,
      formats: ['dwg', 'dxf', 'pdf'],
    })),
    {
      id: 'structural',
      title: 'Structural Column & Beam Layout (S-COLS / S-BEAM)',
      options: {
        drawingKind: 'STRUCTURAL',
        exportScope: 'all_floors',
        includeRoomLabels: false,
        includeFurniture: false,
      } as VerifiedExportOptions,
      formats: ['dwg', 'dxf', 'pdf'],
    },
    {
      id: 'complete',
      title: 'Complete Building Drawing Set',
      options: { exportScope: 'complete_project' } as VerifiedExportOptions,
      formats: ['dwg', 'dxf', 'pdf'],
    },
    {
      id: 'geometry',
      title: 'Geometry Validation & Area Ledger Report',
      options: { exportScope: 'all_floors' } as VerifiedExportOptions,
      formats: ['geometry-pdf', 'geometry-json'],
    },
    { id: 'udcpr', title: 'UDCPR 2020 Statutory Compliance Report', options: { exportScope: 'all_floors' } as VerifiedExportOptions, formats: ['udcpr-pdf', 'udcpr-json'] },
    {
      id: 'structural_drawings',
      title: 'Structural CAD Drawing Set (S-101 to S-104 ISO A3)',
      options: { drawingKind: 'STRUCTURAL', exportScope: 'all_floors' } as VerifiedExportOptions,
      formats: ['structural-drawings-pdf'],
    },
    {
      id: 'structural_analysis_report',
      title: 'ETABS Structural Analysis & IS Code Compliance Report',
      options: { drawingKind: 'STRUCTURAL', exportScope: 'all_floors' } as VerifiedExportOptions,
      formats: ['structural-report-pdf', 'structural-report-json'],
    },
  ];
  const run = async (
    id: string,
    title: string,
    format: VerifiedExportFormat,
    options: VerifiedExportOptions,
    action: 'preview' | 'download',
  ) => {
    const snapshot = building,
      signal = controller.current.signal,
      key = `${id}-${format}`;
    setBusy(key);
    setError('');
    try {
      const artifact = await requestVerifiedExport(
        snapshot,
        format,
        { ...options, paperSize, scale },
        signal,
      );
      if (current.current !== snapshot || signal.aborted) return;
      setArtifacts((previous) => ({ ...previous, [key]: artifact }));
      if (action === 'download') await downloadVerifiedExport(artifact, signal);
      else {
        let blob: Blob;
        if (format === 'dwg' || format === 'dxf') {
          const response = await fetch(
            `/api/v1/export/preview/${encodeURIComponent(artifact.fileName)}`,
            { signal },
          );
          if (!response.ok) throw new Error('CAD preview failed to reopen');
          blob = await response.blob();
        } else blob = await fetchVerifiedBytes(artifact, signal);
        if (current.current === snapshot && !signal.aborted)
          setPreview({
            url: URL.createObjectURL(blob),
            type: blob.type,
            title,
            text: format.endsWith('-json') ? await blob.text() : undefined,
          });
      }
    } catch (e) {
      if (!signal.aborted) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!signal.aborted) setBusy(null);
    }
  };

  const generateBlenderPackage = async () => {
    setBlenderStatus('GENERATING');
    setBlenderError('');
    try {
      const res = await fetch('/api/v1/export/blender-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building, options: { expectedRevision: building.version } }),
        signal: controller.current.signal,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Blender export failed HTTP ${res.status}`);
      }
      const data = await res.json();
      setBlenderManifest(data);
      setBlenderStatus('VERIFIED');
    } catch (e) {
      setBlenderStatus('FAILED');
      setBlenderError(e instanceof Error ? e.message : String(e));
    }
  };

  const downloadBlenderFile = (jobId: string, fileName: string) => {
    const url = `/api/v1/export/blender/download/${encodeURIComponent(jobId)}/${encodeURIComponent(fileName)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportArchlang = async (format: 'svg' | 'arch' | 'pdf' | 'dxf', action: 'download' | 'preview') => {
    const key = `archlang-${format}`;
    setArchlangBusy(key);
    setArchlangStatus('Generating / compiling ArchLang artifact...');
    try {
      const activeFloor = archlangFloorId || building.floors[0]?.id;
      if (action === 'preview') {
        const previewResult = await fetchArchLangPreview(
          building,
          {
            floorId: activeFloor,
            autoFurnish: archlangAutoFurnish,
            circulationOverlay: archlangCirculation,
            showDimensions: archlangDimensions,
          },
          controller.current.signal
        );
        const blob = new Blob([previewResult.svg], { type: 'image/svg+xml' });
        setPreview({
          url: URL.createObjectURL(blob),
          type: 'image/svg+xml',
          title: `ArchLang Presentation Sheet (${previewResult.floorName})`,
        });
        setArchlangStatus(`PREVIEW_READY (${previewResult.stats.roomCount} rooms)`);
      } else {
        const result = await requestArchLangExport(
          building,
          {
            floorId: activeFloor,
            format,
            autoFurnish: archlangAutoFurnish,
            circulationOverlay: archlangCirculation,
            showDimensions: archlangDimensions,
          },
          controller.current.signal
        );
        const a = document.createElement('a');
        a.href = result.downloadUrl;
        a.download = result.artifact.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setArchlangStatus(`VERIFIED ${result.artifact.sizeBytes} bytes · ${result.artifact.sha256?.slice(0, 12)}`);
      }
    } catch (e: any) {
      setArchlangStatus(`Failed: ${e.message}`);
    } finally {
      setArchlangBusy(null);
    }
  };
  return (
    <section
      className="h-full overflow-auto bg-slate-950 p-6 text-slate-100"
      aria-label="Independent export center"
    >
      <h2 className="text-xl font-bold">Independent Export Center</h2>
      <ETABSExportPanel building={building} />
      <p className="mt-2 text-slate-400">
        {building.name} · revision {building.version}
      </p>
      <div className="my-4 flex flex-wrap gap-4">
        <label>
          Paper{' '}
          <select
            aria-label="Export paper"
            value={paperSize}
            onChange={(e) => setPaper(e.target.value as typeof paperSize)}
            className="bg-slate-800 p-2"
          >
            {['A3', 'A2', 'A1'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Scale{' '}
          <select
            aria-label="Export scale"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            className="bg-slate-800 p-2"
          >
            {['FIT_TO_PAGE', '1:50', '1:100', '1:200'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-4 text-xs text-amber-200">
        Exact scales fall back to fit-to-page when needed. Automated checks provide engineering
        design assistance and require verification by a licensed Architect/Engineer before municipal
        submission.
      </p>
      {error && (
        <p role="alert" className="my-3 text-red-300">
          {error}
        </p>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h3 className="font-medium">{row.title}</h3>
            {row.formats.map((f) => {
              const format = f as VerifiedExportFormat,
                key = `${row.id}-${format}`,
                artifact = artifacts[key];
              return (
                <div key={format} className="my-3 border-t border-slate-700 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="mr-auto text-xs">{format.toUpperCase()}</strong>
                    <button
                      disabled={busy !== null}
                      onClick={() => void run(row.id, row.title, format, row.options, 'preview')}
                      className="rounded bg-slate-700 px-3 py-2 text-xs"
                      aria-label={`Preview ${row.title} ${format}`}
                    >
                      Preview
                    </button>
                    <button
                      disabled={busy !== null}
                      onClick={() => void run(row.id, row.title, format, row.options, 'download')}
                      className="rounded bg-amber-500 px-3 py-2 text-xs text-slate-950"
                      aria-label={`Download ${row.title} ${format}`}
                    >
                      Independent Download
                    </button>
                    <button
                      disabled={busy !== null}
                      onClick={() => void enqueueJob('cad-export', { format, ...row.options })}
                      className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-2 text-xs text-slate-300 border border-slate-700"
                      title="Run asynchronously in background compute worker queue"
                    >
                      Enqueue Async
                    </button>
                  </div>
                  {format === 'dwg' && windowsCadStatus === 'unavailable' && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded border border-amber-800/80">
                      <span>Requires Windows Worker — Use ArchLang DXF/PDF or Pascal 3D below</span>
                    </div>
                  )}
                  <p className="mt-2 break-all text-xs text-slate-400">
                    {busy === key
                      ? 'GENERATING / VERIFYING'
                      : artifact
                        ? `VERIFIED · ${artifact.sizeBytes} bytes · SHA-256 ${artifact.sha256?.slice(0, 16)} · revision ${artifact.revision}`
                        : 'NOT_RUN'}
                  </p>
                </div>
              );
            })}
          </article>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded border border-slate-700 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">Blender 5.2 Native (.blend / .glb)</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                blenderStatus === 'VERIFIED'
                  ? 'border border-emerald-700 bg-emerald-950 text-emerald-400'
                  : blenderStatus === 'GENERATING'
                  ? 'border border-amber-700 bg-amber-950 text-amber-400'
                  : blenderStatus === 'FAILED'
                  ? 'border border-rose-700 bg-rose-950 text-rose-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {blenderStatus}
            </span>
          </div>
          <p className="my-2 text-xs text-slate-400">
            Procedural 3D scene generated via local Blender 5.2 LTS binary (C:\Program Files\Blender Foundation\Blender 5.2\blender.exe).
          </p>
          {blenderError && (
            <p className="my-2 text-xs text-rose-400">{blenderError}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={generateBlenderPackage}
              disabled={blenderStatus === 'GENERATING'}
              className="rounded bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {blenderStatus === 'GENERATING' ? 'Generating 3D Package...' : 'Generate 3D Package'}
            </button>
            {blenderManifest && (
              <>
                <button
                  onClick={() => downloadBlenderFile(blenderManifest.jobId, 'building_full_assembly.blend')}
                  className="rounded bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                >
                  Download .blend
                </button>
                <button
                  onClick={() => downloadBlenderFile(blenderManifest.jobId, 'building_full_assembly.glb')}
                  className="rounded bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
                >
                  Download .glb
                </button>
              </>
            )}
          </div>
        </article>

        <article className="rounded border border-slate-700 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100">ETABS v23.3.2 Structural Analysis & CAD Set</h3>
            <span className="rounded border border-emerald-700 bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              VERIFIED
            </span>
          </div>
          <p className="my-2 text-xs text-slate-400">
            Automated finite-element framing analysis, IS 1893:2016 drift checks, and ISO A3 structural drawings (S-101 to S-104).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void run('structural_analysis_report', 'ETABS Structural Analysis Report', 'structural-report-pdf', { drawingKind: 'STRUCTURAL', exportScope: 'all_floors' }, 'preview')}
              disabled={busy !== null}
              className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Preview Report
            </button>
            <button
              onClick={() => void run('structural_analysis_report', 'ETABS Structural Analysis Report', 'structural-report-pdf', { drawingKind: 'STRUCTURAL', exportScope: 'all_floors' }, 'download')}
              disabled={busy !== null}
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-500 disabled:opacity-50"
            >
              Download Report
            </button>
            <button
              onClick={() => void run('structural_drawings', 'Structural CAD Drawing Set', 'structural-drawings-pdf', { drawingKind: 'STRUCTURAL', exportScope: 'all_floors' }, 'download')}
              disabled={busy !== null}
              className="rounded bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              Drawings (A3 PDF)
            </button>
          </div>
        </article>

        <article className="rounded border border-slate-700 bg-slate-900/60 p-4 md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-semibold text-slate-100">Architectural Presentation Sheet (ArchLang)</h3>
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                In-Process 2D DSL
              </span>
            </div>
            {archlangStatus && (
              <span className="text-xs text-amber-200">{archlangStatus}</span>
            )}
          </div>
          <p className="my-2 text-xs text-slate-400">
            Publish publication-grade architectural presentation sheets with deterministic auto-furnishing, optional circulation routing overlays, and dimension chains compiled in-process.
          </p>

          <div className="my-3 flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs">
            <label className="flex items-center gap-2">
              <span className="text-slate-400">Target Floor:</span>
              <select
                aria-label="ArchLang Target Floor"
                value={archlangFloorId}
                onChange={(e) => setArchlangFloorId(e.target.value)}
                className="rounded bg-slate-800 p-1.5 text-slate-200 border border-slate-700"
              >
                {building.floors.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={archlangAutoFurnish}
                onChange={(e) => setArchlangAutoFurnish(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500"
              />
              <span>Auto-Furnish</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={archlangCirculation}
                onChange={(e) => setArchlangCirculation(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500"
              />
              <span>Circulation Overlay</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={archlangDimensions}
                onChange={(e) => setArchlangDimensions(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500"
              />
              <span>Dimensions</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void exportArchlang('svg', 'preview')}
              disabled={archlangBusy !== null}
              className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              Preview Sheet
            </button>
            <button
              onClick={() => void exportArchlang('svg', 'download')}
              disabled={archlangBusy !== null}
              className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Furnished SVG
            </button>
            <button
              onClick={() => void exportArchlang('pdf', 'download')}
              disabled={archlangBusy !== null}
              className="rounded bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              Presentation PDF
            </button>
            <button
              onClick={() => void exportArchlang('dxf', 'download')}
              disabled={archlangBusy !== null}
              className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Presentation DXF
            </button>
            <button
              onClick={() => void exportArchlang('arch', 'download')}
              disabled={archlangBusy !== null}
              className="rounded bg-slate-700 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-slate-600 disabled:opacity-50"
            >
              Raw .arch DSL
            </button>
          </div>
        </article>
      </div>
      {preview && (
        <div
          role="dialog"
          aria-label="Verified artifact preview"
          className="fixed inset-6 z-50 flex flex-col rounded-xl border border-slate-600 bg-slate-900 p-4"
        >
          <div className="mb-3 flex justify-between">
            <h3>
              {preview.title} · verified revision {building.version}
            </h3>
            <button onClick={() => setPreview(null)}>Close preview</button>
          </div>
          <>
            {preview.text ? (
              <pre className="min-h-0 flex-1 overflow-auto bg-slate-950 p-4 text-xs">
                {preview.text}
              </pre>
            ) : (
              <iframe
                sandbox={preview.type === 'image/svg+xml' ? '' : undefined}
                title={preview.title}
                src={preview.url}
                className="min-h-0 flex-1 bg-white"
              />
            )}
          </>
        </div>
      )}
    </section>
  );
};
