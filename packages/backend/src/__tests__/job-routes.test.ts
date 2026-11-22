import { describe, it, expect, beforeEach } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleJobRoutes } from '../api/job-routes.js';
import { InProcessJobQueueAdapter } from '../jobs/job-queue.js';
import { LocalDiskStorageAdapter } from '../storage/object-storage.js';
import { LocalProjectRepository } from '../persistence/project-repository.js';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

function createMockReqRes(method: string, urlStr: string, bodyJson?: unknown) {
  const req = {
    method,
    headers: { host: 'localhost:4200' },
  } as unknown as IncomingMessage;

  let statusCode = 200;
  let headers: Record<string, string> = {};
  let bodyData = '';

  const res = {
    writeHead: (status: number, head: Record<string, string>) => {
      statusCode = status;
      headers = { ...headers, ...head };
    },
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    end: (chunk?: string) => {
      if (chunk) bodyData += chunk;
    },
  } as unknown as ServerResponse;

  const url = new URL(urlStr, 'http://localhost:4200');
  const readBody = async () => (bodyJson !== undefined ? JSON.stringify(bodyJson) : '');
  const sendJson = (r: ServerResponse, status: number, json: unknown) => {
    statusCode = status;
    bodyData = JSON.stringify(json);
  };

  return {
    req,
    res,
    url,
    readBody,
    sendJson,
    getResponse: () => ({
      status: statusCode,
      data: bodyData ? JSON.parse(bodyData) : null,
    }),
  };
}

describe('Job Routes & Capabilities API', () => {
  let tempDir: string;
  let storage: LocalDiskStorageAdapter;
  let repository: LocalProjectRepository;
  let jobQueue: InProcessJobQueueAdapter;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'job-routes-test-'));
    storage = new LocalDiskStorageAdapter(path.join(tempDir, 'storage'));
    repository = new LocalProjectRepository(tempDir);
    jobQueue = new InProcessJobQueueAdapter(repository);
  });

  it('GET /api/health/capabilities returns capability map and provider info', async () => {
    const { req, res, url, readBody, sendJson, getResponse } = createMockReqRes(
      'GET',
      '/api/health/capabilities'
    );

    const handled = await handleJobRoutes(req, res, url, readBody, sendJson, {}, {
      jobQueue,
      repository,
      storage,
      workerRole: 'all',
    });

    expect(handled).toBe(true);
    const resp = getResponse();
    expect(resp.status).toBe(200);
    expect(resp.data.status).toBe('ok');
    expect(resp.data.storageProvider).toBe('local');
    expect(resp.data.databaseProvider).toBe('local');
    expect(resp.data.queueMode).toBe('in-process');
    expect(resp.data.capabilities).toBeDefined();
    expect(resp.data.capabilities.linuxAiWorker).toBe('local');
  });

  it('POST /api/projects/:projectId/jobs enqueues a Linux job into ai-and-light-exports', async () => {
    const { req, res, url, readBody, sendJson, getResponse } = createMockReqRes(
      'POST',
      '/api/projects/proj-101/jobs',
      {
        jobType: 'archlang_export',
        payload: { format: 'svg', theme: 'warm' },
      }
    );

    const handled = await handleJobRoutes(req, res, url, readBody, sendJson, {}, {
      jobQueue,
      repository,
      storage,
    });

    expect(handled).toBe(true);
    const resp = getResponse();
    expect(resp.status).toBe(202);
    expect(resp.data.jobId).toBeDefined();
    expect(resp.data.status).toBe('queued');
    expect(resp.data.queue).toBe('ai-and-light-exports');
    expect(resp.data.jobType).toBe('archlang_export');
  });

  it('POST /api/projects/:projectId/jobs enqueues a Windows job into windows-native-cad', async () => {
    const { req, res, url, readBody, sendJson, getResponse } = createMockReqRes(
      'POST',
      '/api/projects/proj-101/jobs',
      {
        jobType: 'autocad_dwg_export',
        payload: { drawingType: 'architectural' },
      }
    );

    const handled = await handleJobRoutes(req, res, url, readBody, sendJson, {}, {
      jobQueue,
      repository,
      storage,
    });

    expect(handled).toBe(true);
    const resp = getResponse();
    expect(resp.status).toBe(202);
    expect(resp.data.queue).toBe('windows-native-cad');
  });

  it('POST /api/projects/:projectId/jobs returns 400 when missing jobType', async () => {
    const { req, res, url, readBody, sendJson, getResponse } = createMockReqRes(
      'POST',
      '/api/projects/proj-101/jobs',
      { payload: {} }
    );

    const handled = await handleJobRoutes(req, res, url, readBody, sendJson, {}, {
      jobQueue,
      repository,
      storage,
    });

    expect(handled).toBe(true);
    const resp = getResponse();
    expect(resp.status).toBe(400);
    expect(resp.data.error.code).toBe('MISSING_JOB_TYPE');
  });

  it('GET /api/jobs/:jobId returns 404 for unknown job and 200 for tracked job', async () => {
    // 404 check
    const { req: req404, res: res404, url: url404, readBody: rb404, sendJson: sj404, getResponse: gr404 } =
      createMockReqRes('GET', '/api/jobs/non-existent-job-id');

    await handleJobRoutes(req404, res404, url404, rb404, sj404, {}, {
      jobQueue,
      repository,
      storage,
    });
    expect(gr404().status).toBe(404);

    // Enqueue then fetch
    const createdJob = await jobQueue.enqueue(
      'ai-and-light-exports',
      'archlang_export',
      { format: 'dxf' },
      'p-test'
    );

    const { req: req200, res: res200, url: url200, readBody: rb200, sendJson: sj200, getResponse: gr200 } =
      createMockReqRes('GET', `/api/jobs/${createdJob.id}`);

    await handleJobRoutes(req200, res200, url200, rb200, sj200, {}, {
      jobQueue,
      repository,
      storage,
    });
    expect(gr200().status).toBe(200);
    expect(gr200().data.jobId).toBe(createdJob.id);
    expect(gr200().data.status).toBe('queued');
    expect(gr200().data.jobType).toBe('archlang_export');
  });
});
