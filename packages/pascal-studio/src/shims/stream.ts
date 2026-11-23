export class EventEmitter {
  private _events: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, fn: (...args: any[]) => void): this {
    (this._events[event] = this._events[event] || []).push(fn);
    return this;
  }

  once(event: string, fn: (...args: any[]) => void): this {
    const wrapped = (...args: any[]) => {
      this.removeListener(event, wrapped);
      fn(...args);
    };
    return this.on(event, wrapped);
  }

  emit(event: string, ...args: any[]): boolean {
    const handlers = this._events[event] || [];
    for (const h of handlers) h(...args);
    return handlers.length > 0;
  }

  removeListener(event: string, fn: (...args: any[]) => void): this {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter((h) => h !== fn);
    }
    return this;
  }
}

export class Writable extends EventEmitter {
  write(chunk: any, encoding?: any, cb?: any): boolean {
    const callback = typeof encoding === 'function' ? encoding : cb;
    if (callback) callback();
    return true;
  }
  end(chunk?: any, encoding?: any, cb?: any): this {
    if (chunk) this.write(chunk, encoding);
    const callback = typeof encoding === 'function' ? encoding : cb;
    if (callback) callback();
    return this;
  }
  pipe(dest: any): any {
    return dest;
  }
}

export class Readable extends EventEmitter {
  pipe(dest: any): any {
    return dest;
  }
}

export default {
  EventEmitter,
  Writable,
  Readable,
};
