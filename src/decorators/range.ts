import { clamp } from '../utils';

export function range(min = -Infinity, max = Infinity) {
  return (proto: any, key: string) => {
    const alias = `_${key}`;

    Object.defineProperty(proto, key, {
      get() {
        return this[alias];
      },
      set(val: number) {
        Object.defineProperty(this, alias, {
          value: clamp(val, min, max),
          enumerable: false,
          writable: true,
          configurable: true,
        });
      },
      enumerable: true,
      configurable: true,
    });
  };
}
