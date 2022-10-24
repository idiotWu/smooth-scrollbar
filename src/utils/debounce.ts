export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number = 0, leading?: boolean) {
  let timer: number;
  let lastCalledAt = -Infinity;

  return function debouncedFn(this: unknown, ...args: Parameters<T>) {
    if (leading) {
      const now = Date.now();
      const elapsed = now - lastCalledAt;
      lastCalledAt = now;

      if (elapsed >= wait) {
        fn.apply(this, args);
      }
    } else {
      return;
    }

    clearTimeout(timer);

    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
