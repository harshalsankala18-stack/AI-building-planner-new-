import { useEffect, useState, useCallback } from 'react';

export interface SystemCapabilitiesResponse {
  readonly status: 'ok' | 'degraded';
  readonly storageProvider: 'local' | 'cloudflare-r2' | string;
  readonly databaseProvider: 'local' | 'supabase-postgres' | string;
  readonly queueMode: 'in-process' | 'bullmq-redis' | string;
  readonly workerRole: string;
  readonly capabilities: {
    readonly windowsCadRunner: 'local' | 'queued_remote' | 'unavailable';
    readonly etabsRunner: 'local' | 'queued_remote' | 'unavailable';
    readonly blenderRunner: 'local' | 'queued_remote' | 'unavailable';
    readonly linuxAiWorker: string;
  };
}

export function useSystemCapabilities(pollIntervalMs?: number) {
  const [capabilities, setCapabilities] = useState<SystemCapabilitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/health/capabilities');
      if (!res.ok) throw new Error(`Capabilities probe failed (${res.status})`);
      const data = (await res.json()) as SystemCapabilitiesResponse;
      setCapabilities(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load system capabilities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(() => {
        void refresh();
      }, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [refresh, pollIntervalMs]);

  return { capabilities, loading, error, refresh };
}
