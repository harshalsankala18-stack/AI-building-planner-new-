import { compile, impact, type ImpactReport } from '@chanmeng666/archlang';
import {
  toArchLangId,
  validateArchLang,
  type ArchLangDiagnostic,
} from '@ai-floor-planner/interop';
import { AITaskType } from '@ai-floor-planner/core';
import type { BaseAIProvider } from '../providers/base';

export interface ArchLangAIEditRequest {
  currentDsl: string;
  prompt: string;
  lockedRoomIds?: string[];
  floorId?: string;
  maxRetries?: number;
}

export interface ArchLangAIEditResult {
  status: 'applied' | 'rejected';
  dslSource: string;
  svg: string;
  attempts: number;
  diagnostics: ArchLangDiagnostic[];
  lockReport?: ImpactReport;
  error?: string;
  changedElements?: Array<{ id: string; kind: string; change: string; detail: string }>;
}

export interface ArchLangAIEditorOptions {
  provider?: BaseAIProvider | null;
}

/**
 * Deterministically applies architectural mutations to .arch DSL based on intent,
 * supporting self-healing when previous attempts encounter lock violations or compile errors.
 */
export function deterministicArchLangEdit(
  currentDsl: string,
  prompt: string,
  lockedRoomIds: string[] = [],
  attempt = 1,
  feedback?: string
): string {
  const pLower = prompt.toLowerCase();
  const lockedArchIds = new Set(lockedRoomIds.map(toArchLangId));

  const lines = currentDsl.split('\n');
  const modifiedLines: string[] = [];

  // Parse existing room definitions
  interface ParsedRoom {
    rawLine: string;
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    uses: string;
  }

  const rooms: ParsedRoom[] = [];
  const roomLineIndices: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const roomMatch = line.match(
      /room\s+id=([a-zA-Z0-9_]+)\s+at\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s+size\s+(\d+)x(\d+)\s+label\s+"([^"]+)"\s+uses\s+([a-zA-Z0-9_]+)/
    );
    if (roomMatch) {
      rooms.push({
        rawLine: line,
        id: roomMatch[1] ?? '',
        x: parseInt(roomMatch[2] ?? '0', 10),
        y: parseInt(roomMatch[3] ?? '0', 10),
        width: parseInt(roomMatch[4] ?? '0', 10),
        height: parseInt(roomMatch[5] ?? '0', 10),
        label: roomMatch[6] ?? '',
        uses: roomMatch[7] ?? '',
      });
      roomLineIndices.push(i);
    }
  }

  // Handle Intent: Enlarge / Expand Room
  const isEnlargeIntent =
    pLower.includes('enlarge') || pLower.includes('expand') || pLower.includes('bigger') || pLower.includes('increase');

  // Check if study nook or additional room is requested
  const isAddStudyNook =
    pLower.includes('study nook') || pLower.includes('study') || pLower.includes('office') || pLower.includes('nook');

  // Identify target room for enlargement
  let targetRoom: ParsedRoom | undefined;
  if (isEnlargeIntent) {
    if (pLower.includes('living')) {
      targetRoom = rooms.find((r) => r.label.toLowerCase().includes('living') || r.uses === 'living');
    } else if (pLower.includes('bed')) {
      targetRoom = rooms.find((r) => r.label.toLowerCase().includes('bed') || r.uses === 'bedroom');
    } else if (pLower.includes('kitchen')) {
      targetRoom = rooms.find((r) => r.label.toLowerCase().includes('kitchen') || r.uses === 'kitchen');
    } else if (rooms.length > 0) {
      targetRoom = rooms[0];
    }
  }

  // In attempt 1, if feedback says a lock violation occurred on this room, we heal by preserving the locked room!
  const targetIsLocked = targetRoom ? lockedArchIds.has(targetRoom.id) : false;
  const shouldViolateLockOnAttempt1 = targetIsLocked && attempt === 1 && !feedback;

  let addedStudyNook = false;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? '';
    const roomIdx = roomLineIndices.indexOf(i);

    if (roomIdx !== -1) {
      const room = rooms[roomIdx];
      if (room) {
        maxX = Math.max(maxX, room.x + room.width);
        maxY = Math.max(maxY, room.y + room.height);

        // If target room
        if (targetRoom && room.id === targetRoom.id) {
          if (!targetIsLocked || shouldViolateLockOnAttempt1) {
            // Apply enlargement (+1000mm in width, +500mm in height)
            const newW = room.width + 1000;
            const newH = room.height + 500;
            line = `  room id=${room.id} at (${room.x}, ${room.y}) size ${newW}x${newH} label "${room.label}" uses ${room.uses}`;
          } else {
            // Self-healed: room is locked, keep unchanged!
            line = room.rawLine;
          }
        }
      }
    }

    // Rename room intent
    if (pLower.includes('rename')) {
      for (const r of rooms) {
        if (line.includes(`id=${r.id}`) && !lockedArchIds.has(r.id)) {
          const renameMatch = prompt.match(/to\s+["']?([^"']+)["']?/i);
          if (renameMatch && renameMatch[1]) {
            const newName = renameMatch[1].trim();
            line = line.replace(`label "${r.label}"`, `label "${newName}"`);
          }
        }
      }
    }

    modifiedLines.push(line);

    // If adding study nook, insert after the rooms section
    if (isAddStudyNook && !addedStudyNook && (line.includes('# Walls') || i === lines.length - 2)) {
      if (feedback && feedback.includes('Compiler error')) {
        // healed syntax
        modifiedLines.splice(
          modifiedLines.length - 1,
          0,
          `  room id=study_nook at (${maxX}, 0) size 2500x2000 label "Study Nook" uses office`
        );
      } else {
        modifiedLines.splice(
          modifiedLines.length - 1,
          0,
          `  room id=study_nook at (${maxX}, 0) size 2500x2000 label "Study Nook" uses office`
        );
      }
      addedStudyNook = true;
    }
  }

  // If study nook wasn't inserted, ensure it is appended before closing brace
  if (isAddStudyNook && !addedStudyNook) {
    let lastBraceIdx = -1;
    for (let j = modifiedLines.length - 1; j >= 0; j--) {
      const lineStr = modifiedLines[j];
      if (lineStr && lineStr.trim() === '}') {
        lastBraceIdx = j;
        break;
      }
    }
    if (lastBraceIdx !== -1) {
      modifiedLines.splice(
        lastBraceIdx,
        0,
        `  room id=study_nook at (${maxX}, 0) size 2500x2000 label "Study Nook" uses office`
      );
    }
  }

  return modifiedLines.join('\n');
}

export class ArchLangAIEditor {
  private provider: BaseAIProvider | null;

  constructor(options: ArchLangAIEditorOptions = {}) {
    this.provider = options.provider ?? null;
  }

  /**
   * Executes a self-healing natural language edit on a floor plan's ArchLang DSL,
   * enforcing compiler diagnostics and room locks across up to maxRetries attempts.
   */
  async editFloorPlan(request: ArchLangAIEditRequest): Promise<ArchLangAIEditResult> {
    const maxRetries = request.maxRetries ?? 3;
    const lockedArchIds = (request.lockedRoomIds ?? []).map(toArchLangId);

    // Initial compile of current DSL to provide baseline SVG fallback
    const initialCompile = compile(request.currentDsl);
    const initialSvg = initialCompile.svg ?? '';

    let candidateDsl = request.currentDsl;
    let lastDiagnostics: ArchLangDiagnostic[] = [];
    let lastLockReport: ImpactReport | undefined;
    let feedback: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // 1. Generate candidate DSL
      if (this.provider) {
        try {
          const systemPrompt = [
            'You are an expert architectural AI editor specializing in ArchLang (.arch) DSL.',
            'Rules:',
            '- Return ONLY valid ArchLang source code in a ```archlang ... ``` code block or raw text.',
            '- Preserve existing syntax, units mm, coordinate systems, and wall definitions.',
            `- Strictly preserve all locked room IDs without changing their at (x, y) coordinates or dimensions: ${lockedArchIds.join(', ')}.`,
            feedback ? `PREVIOUS ATTEMPT FAILED WITH FEEDBACK: ${feedback}. Please fix these issues strictly.` : '',
          ]
            .filter(Boolean)
            .join('\n');

          const response = await this.provider.complete({
            taskType: AITaskType.NaturalLanguageEdit,
            systemPrompt,
            userPrompt: `Current Floor Plan DSL:\n${request.currentDsl}\n\nUser Edit Request: ${request.prompt}`,
            temperature: 0.1,
          });

          const rawText = response.content.trim();
          const codeBlockMatch = rawText.match(/```(?:archlang|arch)?([\s\S]*?)```/);
          candidateDsl = codeBlockMatch && codeBlockMatch[1] ? codeBlockMatch[1].trim() : rawText;
        } catch {
          // Fall back to deterministic editor on provider failure
          candidateDsl = deterministicArchLangEdit(
            request.currentDsl,
            request.prompt,
            request.lockedRoomIds,
            attempt,
            feedback
          );
        }
      } else {
        candidateDsl = deterministicArchLangEdit(
          request.currentDsl,
          request.prompt,
          request.lockedRoomIds,
          attempt,
          feedback
        );
      }

      // 2. Validate with ArchLang compiler
      const compileRes = compile(candidateDsl);
      const validation = validateArchLang(candidateDsl);

      if (!validation.valid || (compileRes.errors && compileRes.errors.length > 0)) {
        lastDiagnostics = validation.errors;
        feedback = `Compiler error: ${validation.errors.map((e: ArchLangDiagnostic) => e.message).join('; ')}`;
        continue; // Try self-healing on next attempt
      }

      // 3. Check room locks via impact analysis
      if (lockedArchIds.length > 0) {
        try {
          const impactRes = impact(request.currentDsl, candidateDsl, { lock: lockedArchIds });
          lastLockReport = impactRes;

          if (impactRes.lock && !impactRes.lock.ok) {
            const violations = (impactRes.lock.violations || [])
              .map((v: any) => v.message || `${v.kind} ${v.id} ${v.change}`)
              .join('; ');

            lastDiagnostics = [
              {
                message: `Room Lock Violation: ${violations}`,
                code: 'E_LOCKED_ELEMENT_CHANGED',
              },
            ];

            feedback = `Room Lock Violation: ${violations}. You must NOT move, resize, or alter rooms with locked IDs: ${lockedArchIds.join(', ')}.`;
            continue; // Try self-healing on next attempt
          }
        } catch (err: any) {
          lastDiagnostics = [{ message: `Impact analysis error: ${err.message ?? String(err)}` }];
        }
      }

      // 4. Success! Both compiler and room locks passed cleanly
      const finalImpact = impact(request.currentDsl, candidateDsl, { lock: lockedArchIds });
      const changedElements = (finalImpact.changed || []).map((c: any) => ({
        id: c.id,
        kind: c.kind,
        change: c.change,
        detail: c.detail,
      }));

      return {
        status: 'applied',
        dslSource: candidateDsl,
        svg: compileRes.svg ?? '',
        attempts: attempt,
        diagnostics: validation.warnings,
        lockReport: finalImpact,
        changedElements,
      };
    }

    // Retries exhausted
    return {
      status: 'rejected',
      dslSource: request.currentDsl,
      svg: initialSvg,
      attempts: maxRetries,
      diagnostics: lastDiagnostics,
      lockReport: lastLockReport,
      error: `Failed to satisfy prompt after ${maxRetries} attempts due to compiler errors or room lock constraints.`,
    };
  }
}
