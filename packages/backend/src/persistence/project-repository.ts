import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Building } from '@ai-floor-planner/core';
import type { PascalScene } from '@ai-floor-planner/interop';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMockCanonicalBuilding } from '../__fixtures__/canonical-building.js';

export interface ProjectSnapshotRecord {
  building: Building;
  versionNumber: number;
  dslSource?: string;
  lockedRoomIds?: string[];
  source?: string;
  createdAt?: string;
}

export interface PascalSceneRecord {
  scene: PascalScene;
  warnings?: string[];
  savedAt: string;
  lastModifiedBy?: string;
}

export interface ArtifactRecord {
  id?: string;
  projectId: string;
  versionId?: string;
  kind: string;
  format: string;
  storageProvider: 'local' | 'r2';
  storageKey: string;
  sha256: string;
  byteSize: number;
  manifest?: Record<string, unknown>;
  createdAt?: string;
}

export interface JobRecord {
  id: string;
  projectId: string;
  queueName: 'ai-and-light-exports' | 'windows-native-cad';
  jobType: string;
  status: 'queued' | 'active' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown> | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRepository {
  readonly providerName: 'local' | 'supabase';

  getProjectSnapshot(
    projectId: string,
    versionNumber?: number
  ): Promise<ProjectSnapshotRecord | null>;

  saveProjectSnapshot(
    projectId: string,
    snapshot: {
      building: Building;
      versionNumber?: number;
      dslSource?: string;
      lockedRoomIds?: string[];
      source?: string;
    }
  ): Promise<{ versionNumber: number }>;

  getPascalScene(projectId: string): Promise<PascalSceneRecord | null>;

  savePascalScene(
    projectId: string,
    scene: PascalScene,
    warnings?: string[],
    lastModifiedBy?: string
  ): Promise<{ savedAt: string }>;

  deletePascalScene(projectId: string): Promise<boolean>;

  recordArtifact(artifact: ArtifactRecord): Promise<{ id: string }>;

  getArtifactsForProject(projectId: string): Promise<ArtifactRecord[]>;

  saveJob(job: JobRecord): Promise<void>;

  getJob(jobId: string): Promise<JobRecord | null>;

  updateJob(jobId: string, updates: Partial<JobRecord>): Promise<void>;
}

export class RepositoryConfigurationError extends Error {
  constructor(message: string) {
    super(`[RepositoryConfigurationError] ${message}`);
    this.name = 'RepositoryConfigurationError';
  }
}

/**
 * Local file-system and in-memory implementation of ProjectRepository.
 * Default for development, CI, and standalone execution.
 */
export class LocalProjectRepository implements ProjectRepository {
  readonly providerName = 'local' as const;

  private readonly snapshotsDir: string;
  private readonly scenesDir: string;
  private readonly artifactsMap = new Map<string, ArtifactRecord[]>();
  private readonly jobsMap = new Map<string, JobRecord>();
  private readonly inMemoryBuildings = new Map<string, Building>();

  constructor(outputBaseDir = 'output') {
    this.snapshotsDir = path.resolve(outputBaseDir, 'canonical-buildings');
    this.scenesDir = path.resolve(outputBaseDir, 'pascal-scenes');

    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
    if (!fs.existsSync(this.scenesDir)) {
      fs.mkdirSync(this.scenesDir, { recursive: true });
    }
  }

  registerInMemoryBuilding(projectId: string, building: Building): void {
    this.inMemoryBuildings.set(projectId, building);
  }

  async getProjectSnapshot(
    projectId: string,
    versionNumber?: number
  ): Promise<ProjectSnapshotRecord | null> {
    const memory = this.inMemoryBuildings.get(projectId);
    if (memory) {
      return {
        building: memory,
        versionNumber: versionNumber ?? memory.version ?? 1,
      };
    }

    const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.snapshotsDir, `${sanitized}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.floors)) {
          return {
            building: parsed as Building,
            versionNumber: versionNumber ?? parsed.version ?? 1,
            dslSource: parsed._archlangDsl,
            lockedRoomIds: parsed._lockedRoomIds,
          };
        }
      } catch {
        // Fall back to mock
      }
    }

    const mock = createMockCanonicalBuilding();
    return {
      building: { ...mock, projectId },
      versionNumber: versionNumber ?? 1,
    };
  }

  async saveProjectSnapshot(
    projectId: string,
    snapshot: {
      building: Building;
      versionNumber?: number;
      dslSource?: string;
      lockedRoomIds?: string[];
      source?: string;
    }
  ): Promise<{ versionNumber: number }> {
    const versionNumber = snapshot.versionNumber ?? (snapshot.building.version || 1);
    this.inMemoryBuildings.set(projectId, snapshot.building);

    const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.snapshotsDir, `${sanitized}.json`);

    const payload = {
      ...snapshot.building,
      _archlangDsl: snapshot.dslSource,
      _lockedRoomIds: snapshot.lockedRoomIds,
      _source: snapshot.source || 'manual',
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { versionNumber };
  }

  async getPascalScene(projectId: string): Promise<PascalSceneRecord | null> {
    const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.scenesDir, `${sanitized}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.scene && parsed.scene.nodes) {
        return {
          scene: parsed.scene,
          warnings: parsed.warnings ?? [],
          savedAt: parsed.savedAt ?? new Date().toISOString(),
          lastModifiedBy: parsed.lastModifiedBy,
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  async savePascalScene(
    projectId: string,
    scene: PascalScene,
    warnings?: string[],
    lastModifiedBy?: string
  ): Promise<{ savedAt: string }> {
    const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.scenesDir, `${sanitized}.json`);
    const savedAt = new Date().toISOString();

    const record = {
      projectId,
      scene,
      warnings: warnings ?? [],
      savedAt,
      lastModifiedBy,
    };

    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
    return { savedAt };
  }

  async deletePascalScene(projectId: string): Promise<boolean> {
    const sanitized = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.scenesDir, `${sanitized}.json`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  async recordArtifact(artifact: ArtifactRecord): Promise<{ id: string }> {
    const id = artifact.id || randomUUID();
    const entry = {
      ...artifact,
      id,
      createdAt: artifact.createdAt || new Date().toISOString(),
    };

    const existing = this.artifactsMap.get(artifact.projectId) || [];
    existing.push(entry);
    this.artifactsMap.set(artifact.projectId, existing);

    return { id };
  }

  async getArtifactsForProject(projectId: string): Promise<ArtifactRecord[]> {
    return this.artifactsMap.get(projectId) || [];
  }

  async saveJob(job: JobRecord): Promise<void> {
    this.jobsMap.set(job.id, { ...job });
  }

  async getJob(jobId: string): Promise<JobRecord | null> {
    const job = this.jobsMap.get(jobId);
    return job ? { ...job } : null;
  }

  async updateJob(jobId: string, updates: Partial<JobRecord>): Promise<void> {
    const existing = this.jobsMap.get(jobId);
    if (existing) {
      this.jobsMap.set(jobId, {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export interface SupabaseRepositoryOptions {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  client?: SupabaseClient;
}

/**
 * Supabase PostgreSQL implementation of ProjectRepository.
 * Interacts with PostgreSQL tables via Supabase JS client and Service Role Key.
 */
export class SupabaseProjectRepository implements ProjectRepository {
  readonly providerName = 'supabase' as const;
  private readonly client: SupabaseClient;

  constructor(options: SupabaseRepositoryOptions) {
    if (!options.client) {
      if (!options.supabaseUrl) {
        throw new RepositoryConfigurationError('SUPABASE_URL environment variable is required.');
      }
      if (!options.supabaseServiceRoleKey) {
        throw new RepositoryConfigurationError('SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
      }
      this.client = createClient(options.supabaseUrl, options.supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } else {
      this.client = options.client;
    }
  }

  async getProjectSnapshot(
    projectId: string,
    versionNumber?: number
  ): Promise<ProjectSnapshotRecord | null> {
    let query = this.client
      .from('project_versions')
      .select('version_number, canonical_building, archlang_dsl, locked_room_ids, source, created_at')
      .eq('project_id', projectId);

    if (versionNumber !== undefined) {
      query = query.eq('version_number', versionNumber);
    } else {
      query = query.order('version_number', { ascending: false }).limit(1);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return null;
    }

    const row = data[0];
    return {
      building: row.canonical_building as Building,
      versionNumber: row.version_number,
      dslSource: row.archlang_dsl,
      lockedRoomIds: row.locked_room_ids,
      source: row.source,
      createdAt: row.created_at,
    };
  }

  async saveProjectSnapshot(
    projectId: string,
    snapshot: {
      building: Building;
      versionNumber?: number;
      dslSource?: string;
      lockedRoomIds?: string[];
      source?: string;
    }
  ): Promise<{ versionNumber: number }> {
    const versionNumber = snapshot.versionNumber ?? (snapshot.building.version || 1);

    const { error } = await this.client.from('project_versions').upsert({
      project_id: projectId,
      version_number: versionNumber,
      canonical_building: snapshot.building,
      archlang_dsl: snapshot.dslSource,
      locked_room_ids: snapshot.lockedRoomIds ?? [],
      source: snapshot.source ?? 'manual',
    });

    if (error) {
      throw new Error(`Failed to save project version snapshot: ${error.message}`);
    }

    return { versionNumber };
  }

  async getPascalScene(projectId: string): Promise<PascalSceneRecord | null> {
    const { data, error } = await this.client
      .from('pascal_scenes')
      .select('scene_json, warnings, updated_at')
      .eq('project_id', projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      scene: data.scene_json as PascalScene,
      warnings: data.warnings,
      savedAt: data.updated_at,
    };
  }

  async savePascalScene(
    projectId: string,
    scene: PascalScene,
    warnings?: string[]
  ): Promise<{ savedAt: string }> {
    const savedAt = new Date().toISOString();

    const { error } = await this.client.from('pascal_scenes').upsert({
      project_id: projectId,
      scene_json: scene,
      warnings: warnings ?? [],
      updated_at: savedAt,
    });

    if (error) {
      throw new Error(`Failed to save Pascal scene to Supabase: ${error.message}`);
    }

    return { savedAt };
  }

  async deletePascalScene(projectId: string): Promise<boolean> {
    const { error } = await this.client.from('pascal_scenes').delete().eq('project_id', projectId);
    return !error;
  }

  async recordArtifact(artifact: ArtifactRecord): Promise<{ id: string }> {
    const id = artifact.id || randomUUID();
    const { error } = await this.client.from('artifacts').insert({
      id,
      project_id: artifact.projectId,
      version_id: artifact.versionId,
      kind: artifact.kind,
      format: artifact.format,
      storage_provider: artifact.storageProvider,
      storage_key: artifact.storageKey,
      sha256: artifact.sha256,
      byte_size: artifact.byteSize,
      manifest: artifact.manifest ?? {},
    });

    if (error) {
      throw new Error(`Failed to record artifact in Supabase: ${error.message}`);
    }

    return { id };
  }

  async getArtifactsForProject(projectId: string): Promise<ArtifactRecord[]> {
    const { data, error } = await this.client
      .from('artifacts')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      versionId: row.version_id,
      kind: row.kind,
      format: row.format,
      storageProvider: row.storage_provider,
      storageKey: row.storage_key,
      sha256: row.sha256,
      byteSize: Number(row.byte_size),
      manifest: row.manifest,
      createdAt: row.created_at,
    }));
  }

  async saveJob(job: JobRecord): Promise<void> {
    const { error } = await this.client.from('export_jobs').upsert({
      id: job.id,
      project_id: job.projectId,
      queue_name: job.queueName,
      job_type: job.jobType,
      status: job.status,
      progress: job.progress,
      payload: job.payload,
      result: job.result,
      error: job.error,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Failed to save job in Supabase: ${error.message}`);
    }
  }

  async getJob(jobId: string): Promise<JobRecord | null> {
    const { data, error } = await this.client
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      projectId: data.project_id,
      queueName: data.queue_name,
      jobType: data.job_type,
      status: data.status,
      progress: data.progress,
      payload: data.payload,
      result: data.result,
      error: data.error,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateJob(jobId: string, updates: Partial<JobRecord>): Promise<void> {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status !== undefined) updatePayload.status = updates.status;
    if (updates.progress !== undefined) updatePayload.progress = updates.progress;
    if (updates.result !== undefined) updatePayload.result = updates.result;
    if (updates.error !== undefined) updatePayload.error = updates.error;

    const { error } = await this.client
      .from('export_jobs')
      .update(updatePayload)
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update job in Supabase: ${error.message}`);
    }
  }
}

/**
 * Factory creating ProjectRepository based on environment variables.
 */
export function createProjectRepositoryFromEnv(
  env: NodeJS.ProcessEnv = process.env
): ProjectRepository {
  const provider = (env.DATABASE_PROVIDER ?? 'local').trim().toLowerCase();
  if (provider === 'supabase') {
    return new SupabaseProjectRepository({
      supabaseUrl: (env.SUPABASE_URL ?? '').trim(),
      supabaseServiceRoleKey: (env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim(),
    });
  }

  return new LocalProjectRepository(env.LOCAL_OUTPUT_DIR ?? 'output');
}
