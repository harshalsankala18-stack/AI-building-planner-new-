export function inherits(ctor: any, superCtor: any): void {
  if (superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
}

export function deprecate<T extends (...args: any[]) => any>(fn: T, _msg: string): T {
  return fn;
}

export function format(...args: any[]): string {
  return args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
}

export const types = {
  isAnyArrayBuffer: () => false,
  isUint8Array: (v: any) => v instanceof Uint8Array,
};

export default {
  inherits,
  deprecate,
  format,
  types,
};
