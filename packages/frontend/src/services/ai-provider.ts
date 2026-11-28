import { BackendAPI } from './backend-api';
import type { ArchitecturalResearchAgent } from '@ai-floor-planner/ai-orchestration';

/**
 * Frontend AI Provider facade — strictly routed through server-side backend endpoints.
 *
 * SECURITY (Master PRD §36): ZERO API keys or provider credentials are ever
 * hard-coded, committed, or read in client browser bundles. All AI requests
 * route exclusively through `/api/v1/projects/generate` on the backend.
 */
export function getAIService(): BackendAPI {
  return new BackendAPI();
}

/**
 * Architectural research is routed through the server-side backend boundary (PRD §36).
 * No client-side Gemini provider or secret credentials exist in the frontend bundle.
 */
export function getArchitecturalResearchAgent(): ArchitecturalResearchAgent | null {
  return null;
}
