'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @module
 * @export {Function} debounce
 */

// debounce timers reset wait
var RESET_WAIT = 100;

/**
 * Call fn if it isn't be called in a period
 *
 * @param {Function} fn
 * @param {Number} [wait]: debounce wait, default is REST_WAIT
 * @param {Boolean} [immediate]: whether to run task at leading, default is true
 *
 * @return {Function}
 */
var debounce = exports.debounce = function debounce(fn) {
    var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : RESET_WAIT;
    var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

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