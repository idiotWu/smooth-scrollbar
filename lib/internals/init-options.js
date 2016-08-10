'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @prototype {Function} __initOptions
 */

function __initOptions(userPreference) {
    var scrollbar = this;

    var options = {
        speed: 1, // scroll speed scale
        damping: 0.1, // damping factor
        thumbMinSize: 20, // min size for scrollbar thumb
        syncCallbacks: false, // execute callbacks in synchronous
        renderByPixels: true, // rendering by integer pixels
        alwaysShowTracks: false, // keep scrollbar tracks visible
        continuousScrolling: 'auto', // allow outer scrollbars to scroll when reaching edge
        overscrollEffect: false, // overscroll effect, false | 'bounce' | 'glow'
        overscrollEffectColor: '#87ceeb' };

    var limit = {
        damping: [0, 1],
        speed: [0, Infinity],
        thumbMinSize: [0, Infinity],
        overscrollEffect: [false, 'bounce', 'glow']
    };

    var isContinous = function isContinous() {
        var mode = arguments.length <= 0 || arguments[0] === undefined ? 'auto' : arguments[0];

        if (options.overscrollEffect !== false) return false;

        switch (mode) {
            case 'auto':
                return scrollbar.isNestedScrollbar;
            default:
                return !!mode;
        }
    };

    var optionAccessors = {
        // @deprecated
        set ignoreEvents(v) {
            console.warn('`options.ignoreEvents` parameter is deprecated, use `instance#unregisterEvents()` method instead. https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceunregisterevents-regex--regex-regex--');
        },

        // @deprecated
        set friction(v) {
            console.warn('`options.friction=' + v + '` is deprecated, use `options.damping=' + v / 100 + '` instead.');

            this.damping = v / 100;
        },

        get syncCallbacks() {
            return options.syncCallbacks;
        },
        set syncCallbacks(v) {
            options.syncCallbacks = !!v;
        },

        get renderByPixels() {
            return options.renderByPixels;
        },
        set renderByPixels(v) {
            options.renderByPixels = !!v;
        },

        get alwaysShowTracks() {
            return options.alwaysShowTracks;
        },
        set alwaysShowTracks(v) {
            v = !!v;
            options.alwaysShowTracks = v;

            var container = scrollbar.targets.container;


            if (v) {
                scrollbar.showTrack();
                container.classList.add('sticky');
            } else {
                scrollbar.hideTrack();
                container.classList.remove('sticky');
            }
        },

        get continuousScrolling() {
            return isContinous(options.continuousScrolling);
        },
        set continuousScrolling(v) {
            if (v === 'auto') {
                options.continuousScrolling = v;
            } else {
                options.continuousScrolling = !!v;
            }
        },

        get overscrollEffect() {
            return options.overscrollEffect;
        },
        set overscrollEffect(v) {
            if (v && !~limit.overscrollEffect.indexOf(v)) {
                console.warn('`overscrollEffect` should be one of ' + JSON.stringify(limit.overscrollEffect) + ', but got ' + JSON.stringify(v) + '. It will be set to `false` now.');

                v = false;
            }

            options.overscrollEffect = v;
        },

        get overscrollEffectColor() {
            return options.overscrollEffectColor;
        },
        set overscrollEffectColor(v) {
            options.overscrollEffectColor = v;
        }
    };

    Object.keys(options).filter(function (prop) {
        return !optionAccessors.hasOwnProperty(prop);
    }).forEach(function (prop) {
        Object.defineProperty(optionAccessors, prop, {
            enumerable: true,
            get: function get() {
                return options[prop];
            },
            set: function set(v) {
                if (isNaN(parseFloat(v))) {
                    throw new TypeError('expect `options.' + prop + '` to be a number, but got ' + (typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v)));
                }

                options[prop] = _utils.pickInRange.apply(undefined, [v].concat((0, _toConsumableArray3.default)(limit[prop])));
            }
        });
    });

    this.__readonly('options', optionAccessors);
    this.setOptions(userPreference);
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__initOptions', {
    value: __initOptions,
    writable: true,
    configurable: true
});