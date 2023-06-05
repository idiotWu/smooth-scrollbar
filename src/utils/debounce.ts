export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number = 0, leading?: boolean) {
  let timer: ReturnType<typeof setTimeout>;
  let lastCalledAt = -Infinity;

  return function debouncedFn(this: unknown, ...args: Parameters<T>) {
    if (leading) {
      const now = Date.now();
      const elapsed = now - lastCalledAt;
      lastCalledAt = now;

      if (elapsed >= wait) {
        fn.apply(this, args);
      }
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
