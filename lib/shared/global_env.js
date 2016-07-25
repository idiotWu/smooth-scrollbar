'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// global environment

var memoize = function memoize(source) {
    var res = {};
    var cache = {};

    Object.keys(source).forEach(function (prop) {
        Object.defineProperty(res, prop, {
            get: function get() {
                if (!cache.hasOwnProperty(prop)) {
                    var getter = source[prop];

                    cache[prop] = getter();
                }

                return cache[prop];
            }
        });
    });

    return res;
};

var getters = {
    TOUCH_SUPPORTED: function TOUCH_SUPPORTED() {
        return 'ontouchstart' in document;
    },
    EASING_MULTIPLIER: function EASING_MULTIPLIER() {
        return navigator.userAgent.match(/Android/) ? 0.5 : 0.25;
    },
    WHEEL_EVENT: function WHEEL_EVENT() {
        // is standard `wheel` event supported check
        return 'onwheel' in window ? 'wheel' : 'mousewheel';
    }
};

var GLOBAL_ENV = exports.GLOBAL_ENV = memoize(getters);