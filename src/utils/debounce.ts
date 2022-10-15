interface DebounceOptions {
  maxWait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface IDebounceReturn {
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
}

export interface DebouncedReturn<T extends (...args: any[]) => ReturnType<T>> extends IDebounceReturn {
  (...args: Parameters<T>): ReturnType<T> | undefined;
}

export function debounce<T extends (...args: any) => ReturnType<T>>(fn: T, wait?: number, options?: DebounceOptions): DebouncedReturn<T> {

  let lastArgs;
  let lastThis: unknown;
  let timerId: number | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let leading = false;
  let maxing = false;
  let trailing = true;
  let result;

  const useRAF = !wait && wait !== 0 && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';

  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }

  wait = +wait! || 0;
  options = options || {};

  leading = !!options.leading;
  trailing = 'trailing' in options ? !!options.trailing : true;
  maxing = 'maxWait' in options;
  const maxWait = maxing ? Math.max(+options.maxWait! || 0, wait) : null;

  function invokeFunc(time: number) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = null;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc: () => void, wait: number) {
    if (useRAF) {
      window.cancelAnimationFrame(timerId!);
      return window.requestAnimationFrame(pendingFunc);
    }
    return setTimeout(pendingFunc, wait);
  }

  function cancelTimer(id) {
    useRAF ? window.cancelAnimationFrame(id) : clearTimeout(id);
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait! ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait!)
    );
  }

  function timerExpired(): void | ReturnType<any> {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait! - timeSinceLastCall;
    const remainingWait = maxing ? Math.min(timeWaiting, maxWait! - timeSinceLastInvoke) : timeWaiting;

    timerId = startTimer(timerExpired, remainingWait) as number;
  }

  function trailingEdge(time: number) {
    timerId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = null;
    return result;
  }

  function cancel() {
    if (timerId) {
      cancelTimer(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = null;
  }

  function flush() {
    return !timerId ? result : trailingEdge(Date.now());
  }

  function isPending() {
    return !!timerId;
  }

  function debounced(this: unknown, ...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (!timerId) {
        lastInvokeTime = time;
        timerId = startTimer(timerExpired, wait!) as number;
        return leading ? invokeFunc(time) : result;
      }
      if (maxing) {
        timerId = startTimer(timerExpired, wait!) as number;
        return invokeFunc(lastCallTime);
      }
    }
    if (!timerId) {
      timerId = startTimer(timerExpired, wait!) as number;
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.isPending = isPending;

  return debounced;
}
