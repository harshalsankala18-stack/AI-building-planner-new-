/**
 * Server-side credential & service configuration — Master PRD §36.
 *
 * All credentials are read from environment variables here, inside the backend
 * process only. They are never sent to the React frontend, never hard-coded
 * and never logged.
 *
 * There is no image-generation configuration. Plan generation is deterministic
 * and runs in `planning-engine`; the only AI configured here is Gemini, used to
 * interpret a user's brief into structured intent, which is then validated
 * deterministically before it can influence geometry.
 */

export interface ServiceConfig {
  /** 'gemini' (default) or 'local-stub' (explicit dev opt-in only). */
  readonly briefInterpreterKind: 'gemini' | 'local-stub';
  readonly geminiApiKey: string;
  readonly geminiModel: string;
  readonly geminiFallbackModel: string;
  readonly providerTimeoutMs: number;
  readonly port: number;

  /** Phase 5 Production Cloud Split Configuration */
  readonly databaseProvider: 'local' | 'supabase';
  readonly supabaseUrl?: string;
  readonly supabaseServiceRoleKey?: string;

  readonly storageProvider: 'local' | 'r2';
  readonly r2Endpoint?: string;
  readonly r2AccessKeyId?: string;
  readonly r2SecretAccessKey?: string;
  readonly r2Bucket?: string;
  readonly r2PublicBaseUrl?: string;

  readonly redisUrl?: string;
  readonly workerRole: 'api' | 'linux-worker' | 'windows-worker' | 'all';
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveServiceConfig(env: NodeJS.ProcessEnv = process.env): ServiceConfig {

  const interpreterKind = (env.BRIEF_INTERPRETER ?? 'gemini').trim().toLowerCase();
  // Both defaults are real, currently-available Gemini model IDs, verified
  // with a live smoke call against the Generative Language API. The previous
  // fallback default, "gemini-2.5-flash", returns HTTP 404 ("no longer
  // available to new users") and has been removed.
  const primaryModel = (env.GEMINI_MODEL ?? '').trim() || 'gemini-3.6-flash';
  const defaultFallback = primaryModel === 'gemini-3.1-flash-lite' ? 'gemini-3.6-flash' : 'gemini-3.1-flash-lite';
  const fallbackModel = (env.GEMINI_FALLBACK_MODEL ?? '').trim() || defaultFallback;

  const dbProvider = (env.DATABASE_PROVIDER ?? 'local').trim().toLowerCase() === 'supabase' ? 'supabase' : 'local';
  const storeProvider = (env.STORAGE_PROVIDER ?? 'local').trim().toLowerCase() === 'r2' ? 'r2' : 'local';
  const validRoles: ServiceConfig['workerRole'][] = ['api', 'linux-worker', 'windows-worker', 'all'];
  const rawRole = (env.WORKER_ROLE ?? 'all').trim().toLowerCase() as ServiceConfig['workerRole'];
  const workerRole = validRoles.includes(rawRole) ? rawRole : 'all';

  return {
    briefInterpreterKind: interpreterKind === 'local-stub' ? 'local-stub' : 'gemini',
    geminiApiKey: (env.GEMINI_API_KEY ?? '').trim(),
    geminiModel: primaryModel,
    geminiFallbackModel: fallbackModel,
    providerTimeoutMs: positiveInt(env.PROVIDER_TIMEOUT_MS, 60_000),
    port: positiveInt(env.PORT, 4200),

    databaseProvider: dbProvider,
    supabaseUrl: env.SUPABASE_URL?.trim(),
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim(),

    storageProvider: storeProvider,
    r2Endpoint: env.R2_ENDPOINT?.trim(),
    r2AccessKeyId: env.R2_ACCESS_KEY_ID?.trim(),
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY?.trim(),
    r2Bucket: env.R2_BUCKET?.trim(),
    r2PublicBaseUrl: env.R2_PUBLIC_BASE_URL?.trim(),

    redisUrl: env.REDIS_URL?.trim(),
    workerRole,
  };
}

export const resolveImageServiceConfig = resolveServiceConfig;
export type ImageServiceConfig = ServiceConfig;

