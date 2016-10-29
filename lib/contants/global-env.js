'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// global environment

var memoize = function memoize(source) {
    var res = {};
    var cache = {};

    (0, _keys2.default)(source).forEach(function (prop) {
        (0, _defineProperty2.default)(res, prop, {
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

var GLOBAL_ENV = exports.GLOBAL_ENV = memoize(getters);