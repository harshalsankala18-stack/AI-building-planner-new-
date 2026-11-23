import { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import type { Building } from '@ai-floor-planner/core';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';
import type { ProjectRepository } from '../persistence/project-repository.js';

export interface ProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: string;
  readonly plotWidth: number;
  readonly plotDepth: number;
  readonly floorCount: number;
  readonly roomCount: number;
  readonly flatCount: number;
  readonly complianceScore: number;
  readonly category: string;
  readonly status: string;
}

const CANONICAL_BUILDINGS_DIR = path.resolve('output/canonical-buildings');

function ensureDir(p: string): void {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function handleProjectListRoute(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
  _readBody: (req: IncomingMessage) => Promise<string>,
  sendJson: (res: ServerResponse, status: number, json: unknown) => void,
  _corsHeaders: Record<string, string>,
  deps?: { repository?: ProjectRepository }
): Promise<boolean> {
  const method = request.method ?? 'GET';
  const pathname = url.pathname;

  // 1. GET /api/projects or /api/v1/projects
  if (pathname === '/api/projects' || pathname === '/api/v1/projects') {
    if (method !== 'GET') {
      sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET for project list.' } });
      return true;
    }

    const projectsMap = new Map<string, ProjectSummary>();

    // 1. Add Default Demo Project
    const demo = createMockCanonicalBuilding();
    projectsMap.set('proj-demo-canonical', {
      id: 'proj-demo-canonical',
      name: 'Demo Architectural Project (30x50 2BHK)',
      updatedAt: demo.updatedAt || new Date().toISOString(),
      plotWidth: demo.site?.plotWidth || 9.144,
      plotDepth: demo.site?.plotDepth || 15.24,
      floorCount: demo.floors.length || 2,
      roomCount: demo.floors.reduce((acc, f) => acc + (f.rooms?.length || 0), 0) || 5,
      flatCount: demo.floors.reduce((acc, f) => acc + (f.apartmentUnits?.length || 1), 0) || 1,
      complianceScore: (demo.metadata as any)?.complianceReport?.score ?? 94,
      category: 'residential',
      status: 'CONCEPT',
    });

    // 2. Read from disk canonical buildings directory
    ensureDir(CANONICAL_BUILDINGS_DIR);
    try {
      const files = fs.readdirSync(CANONICAL_BUILDINGS_DIR);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = path.join(CANONICAL_BUILDINGS_DIR, file);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(raw);
          const b: Building = parsed.building || parsed;
          if (b && b.projectId && Array.isArray(b.floors)) {
            const pid = b.projectId;
            projectsMap.set(pid, {
              id: pid,
              name: b.name || `Project ${pid}`,
              updatedAt: b.updatedAt || b.createdAt || new Date().toISOString(),
              plotWidth: b.site?.plotWidth || 30,
              plotDepth: b.site?.plotDepth || 50,
              floorCount: b.floors.length,
              roomCount: b.floors.reduce((acc, f) => acc + (f.rooms?.length || 0), 0),
              flatCount: b.floors.reduce((acc, f) => acc + (f.apartmentUnits?.length || 1), 0),
              complianceScore: (b.metadata as any)?.complianceReport?.score ?? 94,
              category: 'residential',
              status: 'APPROVED',
            });
          }
        } catch {
          // ignore individual bad files
        }
      }
    } catch {
      // directory read failure
    }

    const projects = Array.from(projectsMap.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    sendJson(response, 200, {
      projects,
      totalCount: projects.length,
    });
    return true;
  }

  // 2. DELETE /api/projects/:projectId
  const deleteMatch = pathname.match(/^\/api(?:\/v1)?\/projects\/([^/]+)$/);
  if (deleteMatch && method === 'DELETE') {
    const projectId = decodeURIComponent(deleteMatch[1]!);
    try {
      const filePath = path.join(CANONICAL_BUILDINGS_DIR, `${projectId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const scenePath = path.resolve(`output/pascal-scenes/${projectId}.json`);
      if (fs.existsSync(scenePath)) {
        fs.unlinkSync(scenePath);
      }
    } catch (err) {
      console.warn(`Failed to clean disk files for deleted project ${projectId}:`, err);
    }

    sendJson(response, 200, { ok: true, deletedProjectId: projectId });
    return true;
  }

  return false;
}
