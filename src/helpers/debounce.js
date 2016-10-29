// debounce timers reset wait
const RESET_WAIT = 100;

/**
 * Call fn if it isn't be called in a period
 * @param {function} fn
 * @param {number} [wait=100] - Debounce threshold, default is REST_WAIT
 * @param {boolean} [immediate=true] - Whether to run task at leading, default is true
 * @return {function} - The wrapped function
 */
export function debounce(fn, wait = RESET_WAIT, immediate = true) {
    if (typeof fn !== 'function') return;

    let timer;

    return (...args) => {
        if (!timer && immediate) {
            setTimeout(() => fn(...args));
        }

        clearTimeout(timer);

        timer = setTimeout(() => {
            timer = undefined;
            fn(...args);
        }, wait);
    };
};
