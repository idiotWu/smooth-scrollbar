'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.debounce = debounce;
// debounce timers reset wait
var RESET_WAIT = 100;

/**
 * Call fn if it isn't be called in a period
 * @param {function} fn
 * @param {number} [wait=100] - Debounce threshold, default is REST_WAIT
 * @param {boolean} [immediate=true] - Whether to run task at leading, default is true
 * @return {function} - The wrapped function
 */
function debounce(fn) {
    var wait = arguments.length <= 1 || arguments[1] === undefined ? RESET_WAIT : arguments[1];
    var immediate = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    if (typeof fn !== 'function') return;

    var timer = void 0;

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (!timer && immediate) {
            setTimeout(function () {
                return fn.apply(undefined, args);
            });
        }

        clearTimeout(timer);

        timer = setTimeout(function () {
            timer = undefined;
            fn.apply(undefined, args);
        }, wait);
    };
};