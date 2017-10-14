export function boolean(proto: any, key: string) {
  const alias = `_${key}`;

  Object.defineProperty(proto, key, {
    get() {
      return this[alias];
    },
    set(val?: boolean) {
      Object.defineProperty(this, alias, {
        value: !!val,
        enumerable: false,
        writable: true,
        configurable: true,
      });
    },
    enumerable: true,
    configurable: true,
  });
}
