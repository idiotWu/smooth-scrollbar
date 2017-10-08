// global environment
export const GLOBAL_ENV = memoize({
  get MutationObserver(): typeof MutationObserver {
    const global: any = window;

    return global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;
  },
  get TOUCH_SUPPORTED(): boolean {
    return 'ontouchstart' in document;
  },
  get EASING_MULTIPLIER(): number {
    return navigator.userAgent.match(/Android/) ? 0.5 : 0.25;
  },
  get WHEEL_EVENT(): 'wheel' | 'mousewheel' {
    // is standard `wheel` event supported check
    return 'onwheel' in window ? 'wheel' : 'mousewheel';
  },
});

function memoize<T>(source: T): T {
  const res = {} as T;
  const cache = {};

  Object.keys(source).forEach((prop) => {
    Object.defineProperty(res, prop, {
      get() {
        if (!cache.hasOwnProperty(prop)) {
          const desc = Object.getOwnPropertyDescriptor(source, prop);

          cache[prop] = desc.get ? desc.get() : desc.value;
        }

        return cache[prop];
      },
    });
  });

  return res;
}
