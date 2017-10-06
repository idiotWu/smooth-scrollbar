export function boolean(proto: any, key: string) {
  const alias = `_${key}`;

  Object.defineProperty(proto, key, {
    get() {
      return this[alias];
    },
    set(val?: boolean) {
      this[alias] = !!val;
    },
  });
}
