'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                                    * @module
                                                                                                                                                                                                                                                                                    * @prototype {Function} __initOptions
                                                                                                                                                                                                                                                                                    */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

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
        overscrollEffectColor: '#87ceeb', // android overscroll effect color
        overscrollDamping: 0.2 };

    var limit = {
        damping: [0, 1],
        speed: [0, Infinity],
        thumbMinSize: [0, Infinity],
        overscrollEffect: [false, 'bounce', 'glow'],
        overscrollDamping: [0, 1]
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
                console.warn('`overscrollEffect` should be one of ' + (0, _stringify2.default)(limit.overscrollEffect) + ', but got ' + (0, _stringify2.default)(v) + '. It will be set to `false` now.');

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

    (0, _keys2.default)(options).filter(function (prop) {
        return !optionAccessors.hasOwnProperty(prop);
    }).forEach(function (prop) {
        (0, _defineProperty2.default)(optionAccessors, prop, {
            enumerable: true,
            get: function get() {
                return options[prop];
            },
            set: function set(v) {
                if (isNaN(parseFloat(v))) {
                    throw new TypeError('expect `options.' + prop + '` to be a number, but got ' + (typeof v === 'undefined' ? 'undefined' : _typeof(v)));
                }

                options[prop] = _utils.pickInRange.apply(undefined, [v].concat(_toConsumableArray(limit[prop])));
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