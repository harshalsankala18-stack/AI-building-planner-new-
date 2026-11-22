import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type {
  Building,
  ExportFileDescriptor,
  IndependentExportManifest,
} from '@ai-floor-planner/core';
import {
  compileCanonicalFloorWithArchLang,
  compileCanonicalFloorWithArchLangAsync,
  analyzeRoomLockImpact as analyzeLockImpactInterop,
  type CompileCanonicalFloorResult,
  type RoomLockImpactAnalysis,
} from '@ai-floor-planner/interop';
import { canonicalRevisionHash } from './geometry-report.js';
import { ExportError } from './export-selection.js';

export interface ArchLangPreviewOptions {
  floorId?: string;
  autoFurnish?: boolean;
  circulationOverlay?: boolean;
  showDimensions?: boolean;
  lockedRoomIds?: string[];
}

export interface ArchLangExportOptions extends ArchLangPreviewOptions {
  format?: 'svg' | 'dxf' | 'pdf' | 'arch';
}

export interface ArchLangPreviewResult {
  floorId: string;
  floorName: string;
  dslSource: string;
  svg: string;
  validation: CompileCanonicalFloorResult['validation'];
  warnings: string[];
  roomMap: CompileCanonicalFloorResult['roomMap'];
  stats: CompileCanonicalFloorResult['stats'];
}

export interface ArchLangExportResult {
  descriptor: ExportFileDescriptor;
  manifest: IndependentExportManifest;
  downloadUrl: string;
  data: Uint8Array;
  mimeType: string;
  fileName: string;
}

export class ArchLangExportService {
  constructor(readonly directory = path.resolve('output/cad-export/artifacts')) {}

  /**
   * Generates in-process ArchLang presentation sheet preview for a selected canonical floor.
   */
  public generateArchLangPreview(
    building: Building,
    options: ArchLangPreviewOptions = {}
  ): ArchLangPreviewResult {
    if (!building || !Array.isArray(building.floors) || building.floors.length === 0) {
      throw new ExportError('INVALID_BUILDING', 'Building must contain at least one floor', 400);
    }

    const targetFloor = options.floorId
      ? building.floors.find((f) => f.id === options.floorId)
      : building.floors[0]!;

    if (!targetFloor) {
      throw new ExportError(
        'FLOOR_NOT_FOUND',
        `Floor "${options.floorId}" not found in building "${building.name}" (${building.id})`,
        404
      );
    }

    const compileResult = compileCanonicalFloorWithArchLang(building, targetFloor.id, {
      autoFurnish: options.autoFurnish,
      circulationOverlay: options.circulationOverlay,
      showDimensions: options.showDimensions,
      lockedRoomIds: options.lockedRoomIds,
    });

    return {
      floorId: targetFloor.id,
      floorName: targetFloor.name,
      dslSource: compileResult.source,
      svg: compileResult.svg,
      validation: compileResult.validation,
      warnings: compileResult.warnings,
      roomMap: compileResult.roomMap,
      stats: compileResult.stats,
    };
  }

  /**
   * Compiles and exports an ArchLang presentation sheet artifact in the requested format
   * ('svg', 'arch', 'dxf', 'pdf'), persisting it to the verified artifact registry.
   */
  public async exportArchLangArtifact(
    building: Building,
    options: ArchLangExportOptions = {}
  ): Promise<ArchLangExportResult> {
    if (!building || !Array.isArray(building.floors) || building.floors.length === 0) {
      throw new ExportError('INVALID_BUILDING', 'Building must contain at least one floor', 400);
    }

    const targetFloor = options.floorId
      ? building.floors.find((f) => f.id === options.floorId)
      : building.floors[0]!;

    if (!targetFloor) {
      throw new ExportError(
        'FLOOR_NOT_FOUND',
        `Floor "${options.floorId}" not found in building "${building.name}" (${building.id})`,
        404
      );
    }

    const format = options.format ?? 'svg';
    if (!['svg', 'dxf', 'pdf', 'arch'].includes(format)) {
      throw new ExportError(
        'UNSUPPORTED_FORMAT',
        `Unsupported ArchLang export format "${format}". Supported formats are: svg, dxf, pdf, arch.`,
        400
      );
    }

    const compileResult = await compileCanonicalFloorWithArchLangAsync(building, targetFloor.id, {
      format,
      autoFurnish: options.autoFurnish,
      circulationOverlay: options.circulationOverlay,
      showDimensions: options.showDimensions,
      lockedRoomIds: options.lockedRoomIds,
    });

    let data: Uint8Array;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'svg':
        data = Buffer.from(compileResult.svg, 'utf8');
        mimeType = 'image/svg+xml';
        extension = 'svg';
        break;
      case 'arch':
        data = Buffer.from(compileResult.source, 'utf8');
        mimeType = 'text/plain; charset=utf-8';
        extension = 'arch';
        break;
      case 'dxf':
        if (!compileResult.dxf) {
          throw new ExportError('DXF_EXPORT_FAILED', 'ArchLang DXF compilation returned empty data', 500);
        }
        data = Buffer.from(compileResult.dxf, 'utf8');
        mimeType = 'application/dxf';
        extension = 'dxf';
        break;
      case 'pdf':
        if (!compileResult.pdf || compileResult.pdf.length === 0) {
          throw new ExportError('PDF_EXPORT_FAILED', 'ArchLang PDF compilation returned empty data', 500);
        }
        data = compileResult.pdf;
        mimeType = 'application/pdf';
        extension = 'pdf';
        break;
    }

    const revisionHash = canonicalRevisionHash(building);
    const sha256 = createHash('sha256').update(data).digest('hex');
    const clean = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 65);
    const fileName = `${clean(building.id)}_r${building.version}_ARCHLANG_PRESENTATION_${clean(targetFloor.id)}_${revisionHash.slice(0, 12)}_${sha256}.${extension}`;

    fs.mkdirSync(this.directory, { recursive: true });
    const destination = path.join(this.directory, fileName);
    if (!fs.existsSync(destination)) {
      fs.writeFileSync(destination, data);
    }

    const saved = fs.readFileSync(destination);
    if (createHash('sha256').update(saved).digest('hex') !== sha256) {
      throw new ExportError('ARTIFACT_CHECKSUM_MISMATCH', 'Persisted artifact differs from verified bytes', 500);
    }

    const downloadUrl = `/api/v1/export/download/${encodeURIComponent(fileName)}`;

    const descriptor: ExportFileDescriptor = {
      fileId: sha256,
      fileName,
      fileType: extension.toUpperCase() as ExportFileDescriptor['fileType'],
      discipline: 'ARCHITECTURAL',
      title: `ArchLang Presentation Sheet (${targetFloor.name}) - ${format.toUpperCase()}`,
      mimeType,
      sizeBytes: data.length,
      sha256,
      buildingId: building.id,
      revision: building.version,
      revisionHash,
      scope: `ARCHITECTURAL:current_floor:${targetFloor.id}`,
      verification: {
        isValid: compileResult.validation.valid,
        errors: compileResult.validation.errors.map((e) => e.message),
        checks: {
          archlangValid: compileResult.validation.valid,
          warningCount: compileResult.warnings.length,
          roomCount: compileResult.stats.roomCount,
        },
      },
      downloadUrl,
      metadata: {
        format,
        floorId: targetFloor.id,
        autoFurnished: options.autoFurnish ?? false,
        circulationOverlay: options.circulationOverlay ?? false,
        roomCount: compileResult.stats.roomCount,
        lockedRoomCount: compileResult.stats.lockedRoomCount,
      },
    };

    const manifest: IndependentExportManifest = {
      buildingId: building.id,
      projectId: building.projectId,
      revision: building.version,
      revisionHash,
      generatedAt: new Date().toISOString(),
      files: [descriptor],
      overallStatus: compileResult.validation.valid ? 'SUCCESS' : 'FAILURE',
    };

    const manifestPath = `${destination}.manifest.json`;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return {
      descriptor,
      manifest,
      downloadUrl,
      data,
      mimeType,
      fileName,
    };
  }

  /**
   * Analyzes room locking impact, calculating adjacency boundaries, flexible area,
   * and impact constraints for subsequent edits.
   */
  public analyzeRoomLockImpact(
    building: Building,
    floorId: string,
    lockedRoomIds: string[] = [],
    targetRoomId?: string,
    modifiedBuilding?: Building
  ): RoomLockImpactAnalysis {
    if (!building || !Array.isArray(building.floors) || building.floors.length === 0) {
      throw new ExportError('INVALID_BUILDING', 'Building must contain at least one floor', 400);
    }

    const targetFloor = building.floors.find((f) => f.id === floorId);
    if (!targetFloor) {
      throw new ExportError(
        'FLOOR_NOT_FOUND',
        `Floor "${floorId}" not found in building "${building.name}" (${building.id})`,
        404
      );
    }

    return analyzeLockImpactInterop(building, floorId, lockedRoomIds, targetRoomId, modifiedBuilding);
  }
}
