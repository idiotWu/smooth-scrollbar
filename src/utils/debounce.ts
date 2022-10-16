
export function debounce(fn: Function, wait?: number, leading?: boolean) {
  let timer;
  let lastCalledAt = -Infinity;

  function handleLeading(thisArg, args) {
    const now = Date.now();
    const elapsed = now - lastCalledAt;

    lastCalledAt = now;

    if (elapsed >= wait!) {
      fn.apply(thisArg, args);
    }
  }

  return function debouncedFn(this: unknown, ...args) {
    if (leading) {
      handleLeading(this, args);
      return;
    }

    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}
