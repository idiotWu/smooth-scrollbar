import { valueWithin } from '../utils/';

export function range(min = -Infinity, max = Infinity) {
  return (proto: any, key: string) => {
    const alias = `_${key}`;

    Object.defineProperty(proto, key, {
      get() {
        return this[alias];
      },
      set(val: number) {
        this[alias] = valueWithin(val, min, max);
      },
    });
  };
}
