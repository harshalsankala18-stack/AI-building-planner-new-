import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  LocalDiskStorageAdapter,
  CloudflareR2StorageAdapter,
  StorageConfigurationError,
  createObjectStorageFromEnv,
} from '../storage/object-storage.js';

describe('ObjectStorageAdapter', () => {
  describe('LocalDiskStorageAdapter', () => {
    let tempDir: string;
    let adapter: LocalDiskStorageAdapter;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'obj-storage-test-'));
      adapter = new LocalDiskStorageAdapter(tempDir);
    });

    afterEach(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup error
      }
    });

    it('puts and gets an object with accurate SHA-256 and byteSize', async () => {
      const content = 'Test content for local storage adapter';
      const result = await adapter.putObject({
        key: 'projects/p123/model.arch',
        body: content,
        contentType: 'text/plain',
      });

      expect(result.key).toBe('projects/p123/model.arch');
      expect(result.byteSize).toBe(Buffer.byteLength(content));
      expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);

      const retrieved = await adapter.getObject('projects/p123/model.arch');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.toString('utf8')).toBe(content);
    });

    it('checks object existence and deletes an object', async () => {
      expect(await adapter.hasObject('missing.txt')).toBe(false);

      await adapter.putObject({
        key: 'artifacts/test.svg',
        body: '<svg></svg>',
      });

      expect(await adapter.hasObject('artifacts/test.svg')).toBe(true);

      await adapter.deleteObject('artifacts/test.svg');
      expect(await adapter.hasObject('artifacts/test.svg')).toBe(false);
      expect(await adapter.getObject('artifacts/test.svg')).toBeNull();
    });

    it('rejects path traversal attempts outside rootDir', async () => {
      await expect(
        adapter.putObject({
          key: '../../outside.txt',
          body: 'malicious',
        })
      ).rejects.toThrow(/Path traversal attempt rejected/i);

      await expect(adapter.getObject('../../../shadow')).rejects.toThrow(
        /Path traversal attempt rejected/i
      );
    });

    it('generates local download URL with route prefix', async () => {
      const url = await adapter.getSignedDownloadUrl('projects/1/plan.dwg');
      expect(url).toContain('/api/storage/download?key=');
      expect(url).toContain(encodeURIComponent('projects/1/plan.dwg'));
    });
  });

  describe('CloudflareR2StorageAdapter', () => {
    it('throws StorageConfigurationError when required parameters are missing', () => {
      expect(() => {
        new CloudflareR2StorageAdapter({
          bucket: '',
          endpoint: 'https://r2.test',
          accessKeyId: 'key',
          secretAccessKey: 'sec',
        });
      }).toThrow(StorageConfigurationError);

      expect(() => {
        new CloudflareR2StorageAdapter({
          bucket: 'my-bucket',
          endpoint: '',
          accessKeyId: 'key',
          secretAccessKey: 'sec',
        });
      }).toThrow(StorageConfigurationError);
    });

    it('interacts correctly with a provided mock S3Client', async () => {
      const mockSend = vi.fn().mockImplementation(async (command: any) => {
        if (command.constructor.name === 'PutObjectCommand') {
          return {};
        }
        if (command.constructor.name === 'GetObjectCommand') {
          const bodyStream = (async function* () {
            yield Buffer.from('mock r2 content');
          })();
          return { Body: bodyStream };
        }
        if (command.constructor.name === 'HeadObjectCommand') {
          return { ContentLength: 15 };
        }
        if (command.constructor.name === 'DeleteObjectCommand') {
          return {};
        }
        return {};
      });

      const mockClient = {
        send: mockSend,
      } as any;

      const adapter = new CloudflareR2StorageAdapter({
        bucket: 'test-bucket',
        endpoint: 'https://test.r2.cloudflarestorage.com',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
        publicBaseUrl: 'https://cdn.example.com',
        s3Client: mockClient,
      });

      expect(adapter.providerName).toBe('r2');

      const putRes = await adapter.putObject({
        key: 'models/building.ifc',
        body: 'mock r2 content',
      });
      expect(putRes.key).toBe('models/building.ifc');
      expect(mockSend).toHaveBeenCalled();

      const getRes = await adapter.getObject('models/building.ifc');
      expect(getRes?.toString('utf8')).toBe('mock r2 content');

      const exists = await adapter.hasObject('models/building.ifc');
      expect(exists).toBe(true);

      const downloadUrl = await adapter.getSignedDownloadUrl('models/building.ifc');
      expect(downloadUrl).toBe('https://cdn.example.com/models/building.ifc');
    });
  });

  describe('createObjectStorageFromEnv', () => {
    it('creates LocalDiskStorageAdapter by default', () => {
      const adapter = createObjectStorageFromEnv({});
      expect(adapter.providerName).toBe('local');
    });

    it('creates CloudflareR2StorageAdapter when configured in env', () => {
      const mockSend = vi.fn().mockResolvedValue({});
      const adapter = createObjectStorageFromEnv({
        STORAGE_PROVIDER: 'r2',
        R2_ENDPOINT: 'https://test.r2.com',
        R2_ACCESS_KEY_ID: 'key',
        R2_SECRET_ACCESS_KEY: 'secret',
        R2_BUCKET: 'prod-bucket',
      });
      expect(adapter.providerName).toBe('r2');
    });
  });
});
