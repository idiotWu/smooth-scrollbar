'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GLOBAL_ENV = undefined;

var _helpers = require('../helpers/');

// global environment
var getters = {
    MutationObserver: function MutationObserver() {
        return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    },
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

var GLOBAL_ENV = exports.GLOBAL_ENV = (0, _helpers.memoize)(getters);