import { Writable } from './stream';

class BlobStream extends Writable {
  _chunks: Uint8Array[] = [];
  _blob: Blob | null = null;
  length = 0;

  override write(chunk: any, encoding?: any, cb?: any): boolean {
    const callback = typeof encoding === 'function' ? encoding : cb;
    const u8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
    this.length += u8.length;
    this._chunks.push(u8);
    if (callback) callback();
    return true;
  }

  override end(chunk?: any, encoding?: any, cb?: any): this {
    if (chunk) this.write(chunk, encoding);
    const callback = typeof encoding === 'function' ? encoding : cb;
    if (callback) callback();
    return this;
  }

  toBlob(type = 'application/octet-stream'): Blob {
    if (!this._blob) {
      this._blob = new Blob(this._chunks, { type });
      this._chunks = [];
    }
    return this._blob;
  }

  toBlobURL(type?: string): string {
    return URL.createObjectURL(this.toBlob(type));
  }
}

export default function createBlobStream(): BlobStream {
  return new BlobStream();
}
