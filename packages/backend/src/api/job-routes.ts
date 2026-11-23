import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveQueueForJobType } from '../jobs/job-types.js';
import type { JobQueueAdapter } from '../jobs/job-queue.js';
import type { ProjectRepository } from '../persistence/project-repository.js';
import type { ObjectStorageAdapter } from '../storage/object-storage.js';
import { resolveAccoreConsole } from '../cad/accoreconsole-runner.js';
import { resolveBlenderExecutable } from '../blender/blender-runner.js';
import { detectETABS } from '../services/etabs-connector.js';

export interface JobRouteDeps {
  jobQueue: JobQueueAdapter;
  repository: ProjectRepository;
  storage: ObjectStorageAdapter;
  workerRole?: string;
}

export async function handleJobRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  readBody: (req: IncomingMessage) => Promise<string>,
  sendJson: (res: ServerResponse, status: number, json: unknown) => void,
  _corsHeaders: Record<string, string>,
  deps: JobRouteDeps
): Promise<boolean> {
  const method = request.method ?? 'GET';
  const pathname = url.pathname;

  // 1. GET /api/health/capabilities or /api/v1/health/capabilities
  if (method === 'GET' && (pathname === '/api/health/capabilities' || pathname === '/api/v1/health/capabilities')) {
    const hasRedis = Boolean(process.env.REDIS_URL && process.env.REDIS_URL.trim().length > 0);
    const accoreConsole = resolveAccoreConsole();

    let blenderAvailable = false;
    try {
      resolveBlenderExecutable();
      blenderAvailable = true;
    } catch {
      blenderAvailable = false;
    }

    const etabsInfo = await detectETABS();
    const etabsAvailable = etabsInfo.status === 'DETECTED';

    const windowsCadStatus = accoreConsole
      ? 'local'
      : hasRedis
      ? 'queued_remote'
      : 'unavailable';

    const etabsStatus = etabsAvailable
      ? 'local'
      : hasRedis
      ? 'queued_remote'
      : 'unavailable';

    const blenderStatus = blenderAvailable
      ? 'local'
      : hasRedis
      ? 'queued_remote'
      : 'unavailable';

    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    const hasOpenAi = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
    const aiProvider = hasGemini ? 'gemini' : hasOpenAi ? 'openai' : 'rule-based';

    sendJson(response, 200, {
      status: 'ok',
      storageProvider: deps.storage.providerName,
      databaseProvider: deps.repository.providerName,
      queueMode: deps.jobQueue.mode,
      workerRole: deps.workerRole ?? process.env.WORKER_ROLE ?? 'all',
      aiProvider,
      geminiConfigured: hasGemini,
      openaiConfigured: hasOpenAi,
      capabilities: {
        windowsCadRunner: windowsCadStatus,
        etabsRunner: etabsStatus,
        blenderRunner: blenderStatus,
        linuxAiWorker: 'local',
        aiEngine: aiProvider,
      },
    });
    return true;
  }

  // 2. POST /api/projects/:projectId/jobs
  const enqueueMatch = pathname.match(/^\/api(?:\/v1)?\/projects\/([^/]+)\/jobs$/);
  if (enqueueMatch) {
    if (method !== 'POST') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST to enqueue jobs.' } });
      return true;
    }

    const projectId = decodeURIComponent(enqueueMatch[1]!);
    let body: any = {};
    try {
      const raw = await readBody(request);
      body = raw.length > 0 ? JSON.parse(raw) : {};
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('payload too large') || err?.message?.toLowerCase().includes('too large')) {
        sendJson(response, 413, { error: { code: 'PAYLOAD_TOO_LARGE', message: err.message } });
        return true;
      }
      sendJson(response, 400, { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } });
      return true;
    }

    const jobType = body.jobType;
    if (!jobType || typeof jobType !== 'string') {
      sendJson(response, 400, {
        error: { code: 'MISSING_JOB_TYPE', message: 'jobType is required to enqueue a job.' },
      });
      return true;
    }

    const queue = resolveQueueForJobType(jobType);
    const payload = body.payload ?? {};

    try {
      const job = await deps.jobQueue.enqueue(queue, jobType, payload, projectId);
      sendJson(response, 202, {
        jobId: job.id,
        status: job.status,
        queue: job.queueName,
        jobType: job.jobType,
      });
    } catch (err: any) {
      sendJson(response, 500, {
        error: { code: 'ENQUEUE_FAILED', message: err.message ?? String(err) },
      });
    }
    return true;
  }

  // 3. GET /api/jobs/:jobId
  const getJobMatch = pathname.match(/^\/api(?:\/v1)?\/jobs\/([^/]+)$/);
  if (getJobMatch) {
    if (method !== 'GET') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET to check job status.' } });
      return true;
    }

    const jobId = decodeURIComponent(getJobMatch[1]!);
    const job = await deps.jobQueue.getJobStatus(jobId);

    if (!job) {
      sendJson(response, 404, {
        error: { code: 'JOB_NOT_FOUND', message: `Job "${jobId}" was not found.` },
      });
      return true;
    }

    sendJson(response, 200, {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      queueName: job.queueName,
      jobType: job.jobType,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    });
    return true;
  }

  return false;
}
