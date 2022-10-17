
export function debounce<T extends (...args: any[]) => void>(fn: T, wait?: number, leading?: boolean) {
  let timer: number | NodeJS.Timeout;
  let lastCalledAt = -Infinity;


  return function debouncedFn(this: unknown, ...args: Parameters<T>) {
    if (leading) {
      const now = Date.now();
      const elapsed = now - lastCalledAt;

      lastCalledAt = now;

      if (elapsed >= wait!) {
        fn.apply(this, args);
      }
      return;
    }

    clearTimeout(timer as number);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
