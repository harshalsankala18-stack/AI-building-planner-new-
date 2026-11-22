import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PutObjectParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface PutObjectResult {
  key: string;
  sha256: string;
  byteSize: number;
}

export interface ObjectStorageAdapter {
  readonly providerName: 'local' | 'r2';
  putObject(params: PutObjectParams): Promise<PutObjectResult>;
  getObject(key: string): Promise<Buffer | null>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  hasObject(key: string): Promise<boolean>;
}

export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(`[StorageConfigurationError] ${message}`);
    this.name = 'StorageConfigurationError';
  }
}

/**
 * Local disk implementation of ObjectStorageAdapter.
 * Default for development, CI, and offline testing.
 */
export class LocalDiskStorageAdapter implements ObjectStorageAdapter {
  readonly providerName = 'local' as const;
  readonly rootDir: string;

  constructor(rootDir?: string) {
    this.rootDir = rootDir ? path.resolve(rootDir) : path.resolve('output/storage');
    if (!fs.existsSync(this.rootDir)) {
      fs.mkdirSync(this.rootDir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    const cleanKey = key.replace(/^[/\\]+/, '');
    const resolved = path.resolve(this.rootDir, cleanKey);
    if (!resolved.startsWith(this.rootDir)) {
      throw new Error(`Path traversal attempt rejected for storage key "${key}".`);
    }
    return resolved;
  }

  async putObject(params: PutObjectParams): Promise<PutObjectResult> {
    const filePath = this.resolveSafePath(params.key);
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const buffer = Buffer.isBuffer(params.body)
      ? params.body
      : typeof params.body === 'string'
      ? Buffer.from(params.body, 'utf8')
      : Buffer.from(params.body);

    fs.writeFileSync(filePath, buffer);

    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const byteSize = buffer.byteLength;

    return {
      key: params.key,
      sha256,
      byteSize,
    };
  }

  async getObject(key: string): Promise<Buffer | null> {
    const filePath = this.resolveSafePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath);
  }

  async getSignedDownloadUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    const sanitizedKey = encodeURIComponent(key.replace(/^[/\\]+/, ''));
    return `/api/storage/download?key=${sanitizedKey}`;
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = this.resolveSafePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async hasObject(key: string): Promise<boolean> {
    const filePath = this.resolveSafePath(key);
    return fs.existsSync(filePath);
  }
}

export interface CloudflareR2StorageOptions {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string;
  s3Client?: S3Client;
}

/**
 * Cloudflare R2 implementation of ObjectStorageAdapter.
 * Uses AWS S3 v3 SDK with presigned download URL support.
 */
export class CloudflareR2StorageAdapter implements ObjectStorageAdapter {
  readonly providerName = 'r2' as const;
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(options: CloudflareR2StorageOptions) {
    if (!options.bucket) {
      throw new StorageConfigurationError('R2_BUCKET environment variable is required.');
    }
    if (!options.s3Client) {
      if (!options.endpoint) {
        throw new StorageConfigurationError('R2_ENDPOINT environment variable is required.');
      }
      if (!options.accessKeyId) {
        throw new StorageConfigurationError('R2_ACCESS_KEY_ID environment variable is required.');
      }
      if (!options.secretAccessKey) {
        throw new StorageConfigurationError('R2_SECRET_ACCESS_KEY environment variable is required.');
      }
    }

    this.bucket = options.bucket;
    this.publicBaseUrl = options.publicBaseUrl;
    this.client =
      options.s3Client ??
      new S3Client({
        region: 'auto',
        endpoint: options.endpoint,
        credentials: {
          accessKeyId: options.accessKeyId,
          secretAccessKey: options.secretAccessKey,
        },
      });
  }

  async putObject(params: PutObjectParams): Promise<PutObjectResult> {
    const buffer = Buffer.isBuffer(params.body)
      ? params.body
      : typeof params.body === 'string'
      ? Buffer.from(params.body, 'utf8')
      : Buffer.from(params.body);

    const sha256 = createHash('sha256').update(buffer).digest('hex');
    const byteSize = buffer.byteLength;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: buffer,
        ContentType: params.contentType,
        Metadata: {
          ...params.metadata,
          sha256,
        },
      })
    );

    return {
      key: params.key,
      sha256,
      byteSize,
    };
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      if (!response.Body) return null;
      const stream = response.Body as any;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (this.publicBaseUrl) {
      const base = this.publicBaseUrl.replace(/\/$/, '');
      const cleanKey = key.replace(/^[/\\]+/, '');
      return `${base}/${cleanKey}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async hasObject(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }
}

/**
 * Factory that instantiates the active ObjectStorageAdapter based on environment configuration.
 */
export function createObjectStorageFromEnv(env: NodeJS.ProcessEnv = process.env): ObjectStorageAdapter {
  const provider = (env.STORAGE_PROVIDER ?? 'local').trim().toLowerCase();
  if (provider === 'r2') {
    return new CloudflareR2StorageAdapter({
      endpoint: (env.R2_ENDPOINT ?? '').trim(),
      accessKeyId: (env.R2_ACCESS_KEY_ID ?? '').trim(),
      secretAccessKey: (env.R2_SECRET_ACCESS_KEY ?? '').trim(),
      bucket: (env.R2_BUCKET ?? '').trim(),
      publicBaseUrl: env.R2_PUBLIC_BASE_URL?.trim(),
    });
  }

  return new LocalDiskStorageAdapter(
    env.LOCAL_STORAGE_DIR ? path.resolve(env.LOCAL_STORAGE_DIR) : undefined
  );
}
