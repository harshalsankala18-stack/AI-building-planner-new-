import type { PascalScene } from '@ai-floor-planner/interop';
import {
  applyPascalOperations,
  type PascalSceneOperation,
  type PascalMutationResult,
} from '@ai-floor-planner/interop';
import { AITaskType } from '@ai-floor-planner/core';
import type { BaseAIProvider } from '../providers/base';

export interface PascalAIEditRequest {
  scene: PascalScene;
  prompt: string;
  maxAttempts?: number;
}

export interface PascalAIEditResult {
  status: 'applied' | 'rejected';
  scene: PascalScene;
  appliedOperations: PascalSceneOperation[];
  refusals: string[];
  attempts: number;
  error?: string;
}

export interface PascalAIEditorOptions {
  provider?: BaseAIProvider | null;
}

/**
 * Deterministically extracts 3D Pascal scene operations from natural language requests,
 * taking previous attempt refusals into account to repair coordinate or sizing violations.
 */
export function deterministicPascalOperations(
  scene: PascalScene,
  prompt: string,
  _attempt = 1,
  feedback?: string
): PascalSceneOperation[] {
  const pLower = prompt.toLowerCase();
  const operations: PascalSceneOperation[] = [];

  const nodes = scene.nodes as Record<string, any>;
  const zones: any[] = Object.values(nodes).filter((n: any) => n && n.type === 'zone');
  const walls: any[] = Object.values(nodes).filter((n: any) => n && n.type === 'wall');

  // 1. Furnishing intent
  if (
    pLower.includes('furnish') ||
    pLower.includes('sofa') ||
    pLower.includes('dining table') ||
    pLower.includes('bed') ||
    pLower.includes('desk') ||
    pLower.includes('furniture')
  ) {
    // Find matching zone
    let targetZone: any;
    if (pLower.includes('living')) {
      targetZone = zones.find((z) => z.name?.toLowerCase().includes('living') || z.metadata?.type === 'living');
    } else if (pLower.includes('bed')) {
      targetZone = zones.find((z) => z.name?.toLowerCase().includes('bed') || z.metadata?.type === 'bedroom');
    } else if (pLower.includes('dining')) {
      targetZone = zones.find((z) => z.name?.toLowerCase().includes('dining') || z.metadata?.type === 'dining');
    } else {
      targetZone = zones[0];
    }

    if (targetZone) {
      // Calculate zone center
      let cx = 0;
      let cz = 0;
      if (Array.isArray(targetZone.polygon) && targetZone.polygon.length > 0) {
        let sumX = 0;
        let sumZ = 0;
        for (const pt of targetZone.polygon) {
          sumX += pt[0];
          sumZ += pt[1];
        }
        cx = sumX / targetZone.polygon.length;
        cz = sumZ / targetZone.polygon.length;
      }

      const isOutsideRefusal = feedback && feedback.includes('outside the boundary');

      // Place sofa
      if (pLower.includes('sofa') || pLower.includes('living') || pLower.includes('furnish')) {
        // If repaired after refusal, place exactly at center; otherwise apply modest offset
        const xOffset = isOutsideRefusal ? 0 : -0.6;
        operations.push({
          type: 'add_furniture_item',
          zoneId: targetZone.id,
          name: 'Modern Sofa',
          itemType: 'sofa',
          position: [Number((cx + xOffset).toFixed(2)), 0, Number(cz.toFixed(2))],
        });
      }

      // Place dining table
      if (pLower.includes('dining table') || pLower.includes('table')) {
        const xOffset = isOutsideRefusal ? 0 : 0.8;
        operations.push({
          type: 'add_furniture_item',
          zoneId: targetZone.id,
          name: 'Dining Table',
          itemType: 'dining_table',
          position: [Number((cx + xOffset).toFixed(2)), 0, Number(cz.toFixed(2))],
        });
      }

      // Place bed
      if (pLower.includes('bed')) {
        operations.push({
          type: 'add_furniture_item',
          zoneId: targetZone.id,
          name: 'Queen Bed',
          itemType: 'bed',
          position: [Number(cx.toFixed(2)), 0, Number(cz.toFixed(2))],
        });
      }
    }
  }

  // 2. Add Window intent
  if (pLower.includes('window')) {
    let targetWall: any;
    if (pLower.includes('north')) {
      // Find north-most wall (highest Y start/end)
      targetWall = walls.reduce((prev: any, curr: any) => {
        const currMaxY = Math.max(curr.start[1], curr.end[1]);
        const prevMaxY = prev ? Math.max(prev.start[1], prev.end[1]) : -Infinity;
        return currMaxY > prevMaxY ? curr : prev;
      }, null);
    } else if (pLower.includes('south')) {
      targetWall = walls.reduce((prev: any, curr: any) => {
        const currMinY = Math.min(curr.start[1], curr.end[1]);
        const prevMinY = prev ? Math.min(prev.start[1], prev.end[1]) : Infinity;
        return currMinY < prevMinY ? curr : prev;
      }, null);
    } else {
      targetWall = walls[0];
    }

    if (targetWall) {
      const dx = targetWall.end[0] - targetWall.start[0];
      const dy = targetWall.end[1] - targetWall.start[1];
      const wallLen = Math.hypot(dx, dy);

      const winWidth = 1.2;
      const isExceededRefusal = feedback && feedback.includes('exceeds wall');
      // If previous attempt had offset error, safely center window
      const offset = isExceededRefusal
        ? Math.max(0, (wallLen - winWidth) / 2)
        : Math.max(0, Math.min(wallLen - winWidth, 1.0));

      operations.push({
        type: 'add_opening',
        wallId: targetWall.id,
        openingType: 'window',
        width: winWidth,
        height: 1.4,
        sillHeight: 0.9,
        offset: Number(offset.toFixed(2)),
      });
    }
  }

  // 3. Add Door intent
  if (pLower.includes('door')) {
    const targetWall = walls[0];
    if (targetWall) {
      const dx = targetWall.end[0] - targetWall.start[0];
      const dy = targetWall.end[1] - targetWall.start[1];
      const wallLen = Math.hypot(dx, dy);
      const doorWidth = 0.9;
      const offset = Math.max(0, (wallLen - doorWidth) / 2);

      operations.push({
        type: 'add_opening',
        wallId: targetWall.id,
        openingType: 'door',
        width: doorWidth,
        height: 2.1,
        offset: Number(offset.toFixed(2)),
      });
    }
  }

  // 4. Update Wall thickness / height
  if (pLower.includes('thick') || (pLower.includes('wall') && pLower.includes('update'))) {
    const targetWall = walls[0];
    if (targetWall) {
      operations.push({
        type: 'update_wall',
        wallId: targetWall.id,
        thickness: 0.25,
      });
    }
  }

  // 5. Remove node
  if (pLower.includes('remove') || pLower.includes('delete')) {
    // Check if an item node exists to remove
    const itemNode = Object.values(nodes).find((n: any) => n && n.type === 'item');
    if (itemNode) {
      operations.push({
        type: 'remove_node',
        nodeId: itemNode.id,
      });
    }
  }

  return operations;
}

export class PascalAIEditor {
  private provider: BaseAIProvider | null;

  constructor(options: PascalAIEditorOptions = {}) {
    this.provider = options.provider ?? null;
  }

  /**
   * Executes headless mutations on a PascalScene with structured natural language parsing
   * and a 2-attempt self-repair loop on mutation refusals.
   */
  async editPascalScene(request: PascalAIEditRequest): Promise<PascalAIEditResult> {
    const maxAttempts = request.maxAttempts ?? 2;
    let feedback: string | undefined;
    let lastRefusals: string[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Generate operations
      let operations: PascalSceneOperation[];

      if (this.provider) {
        try {
          const systemPrompt = [
            'You are an expert 3D architectural coordinator modifying a Pascal 3D scene graph.',
            'Available operations: add_opening, update_wall, add_furniture_item, rename_or_update_zone, remove_node.',
            'Return a JSON array of operations.',
            feedback ? `PREVIOUS ATTEMPT FAILED WITH REFUSALS: ${feedback}. Please fix parameters.` : '',
          ]
            .filter(Boolean)
            .join('\n');

          const response = await this.provider.complete({
            taskType: AITaskType.NaturalLanguageEdit,
            prompt: `Prompt: ${request.prompt}`,
            systemPrompt,
            userPrompt: `Prompt: ${request.prompt}`,
            temperature: 0.1,
          } as any);

          const raw = response.content.trim();
          const jsonMatch = raw.match(/\[[\s\S]*\]/);
          operations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch {
          operations = deterministicPascalOperations(request.scene, request.prompt, attempt, feedback);
        }
      } else {
        operations = deterministicPascalOperations(request.scene, request.prompt, attempt, feedback);
      }

      if (operations.length === 0) {
        lastRefusals = ['No actionable 3D operations parsed from prompt.'];
        break;
      }

      // Execute operations headlessly
      const mutationResult: PascalMutationResult = applyPascalOperations(request.scene, operations);

      if (mutationResult.success) {
        return {
          status: 'applied',
          scene: mutationResult.scene,
          appliedOperations: mutationResult.appliedOperations,
          refusals: [],
          attempts: attempt,
        };
      }

      // Refusal encountered; prepare feedback for attempt 2
      lastRefusals = mutationResult.refusals;
      feedback = mutationResult.refusals.join('; ');
    }

    return {
      status: 'rejected',
      scene: request.scene,
      appliedOperations: [],
      refusals: lastRefusals,
      attempts: maxAttempts,
      error: `Failed to apply 3D mutations after ${maxAttempts} attempts: ${lastRefusals.join('; ')}`,
    };
  }
}

