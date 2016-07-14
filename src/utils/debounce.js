/**
 * @module
 * @export {Function} debounce
 */

// debounce timers reset wait
const RESET_WAIT = 100;

/**
 * Call fn if it isn't be called in a period
 *
 * @param {Function} fn
 * @param {Number} [wait]: debounce wait, default is REST_WAIT
 * @param {Boolean} [immediate]: whether to run task at leading, default is true
 *
 * @return {Function}
 */
export const debounce = (fn, wait = RESET_WAIT, immediate = true) => {
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
