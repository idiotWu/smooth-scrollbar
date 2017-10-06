import clamp from 'lodash.clamp';

export function range(min = -Infinity, max = Infinity) {
  return (proto: any, key: string) => {
    const alias = `_${key}`;

    Object.defineProperty(proto, key, {
      get() {
        return this[alias];
      },
      set(val: number) {
        this[alias] = clamp(val, min, max);
      },
    });
  };
}
