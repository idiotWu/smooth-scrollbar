import { uniqueString } from './unique-string';

// debounce timers reset wait
const RESET_WAIT = 100;

let id = 0;

/**
 * Call fn if it isn't be called in a period
 * @param {function} fn
 * @param {number} [wait=100] - Debounce threshold, default is REST_WAIT
 * @param {boolean} [immediate=true] - Whether to run task at leading, default is true
 * @return {function} - The wrapped function
 */
export function debounce(fn, wait = RESET_WAIT, immediate = true) {
    if (typeof fn !== 'function') {
        throw new TypeError(`[smooth-scrollbar]: expect fn to be a function, but got ${typeof fn}`);
    }

    const namespace = Object.create(null);
    const debounceSymbol = uniqueString(`debounce$${fn.name || id++}@${wait}`);

    return function wrapped(...args) {
        // support debounced methods
        const ns = this || namespace;

        if (!ns[debounceSymbol] && immediate) {
            setTimeout(() => fn.apply(this, args));
        }

        clearTimeout(ns[debounceSymbol]);

        const timerID = setTimeout(() => {
            delete ns[debounceSymbol];
            fn.apply(this, args);
        }, wait);

        Object.defineProperty(ns, debounceSymbol, {
            value: timerID,
            enumerable: false,
            configurable: true,
            writable: true,
        });
    };
};
