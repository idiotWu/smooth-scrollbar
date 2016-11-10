'use strict';

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.initPrivates = initPrivates;

var _contants = require('../../contants/');

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _render = require('../render/');

var _apis = require('../apis/');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Initialize private props&methods
 * @private
 */
function initPrivates() {
    var _Object$definePropert, _context;

    var scb = this;

    (0, _defineProperties2.default)(this, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, _contants.PRIVATE_PROPS, {
        value: {}
    }), _defineProperty(_Object$definePropert, _contants.PRIVATE_METHODS, {
        value: {}
    }), _Object$definePropert));

    // private properties
    (_context = _utils.setPrivateProp.call(this, {
        get MAX_OVERSCROLL() {
            var _ref = _utils.getPrivateProp.call(scb),
                options = _ref.options,
                size = _ref.size;

            switch (options.overscrollEffect) {
                case _contants.OVERSCROLL_GLOW:
                    var diagonal = Math.floor(Math.sqrt(Math.pow(size.container.width, 2) + Math.pow(size.container.height, 2)));
                    var touchFactor = _render.isMovementLocked.call(scb) ? 2 : 10;

                    return _contants.GLOBAL_ENV.TOUCH_SUPPORTED ? (0, _helpers.pickInRange)(diagonal / touchFactor, 100, 1000) : (0, _helpers.pickInRange)(diagonal / 10, 25, 50);

                case _contants.OVERSCROLL_BOUNCE:
                    return 150;

                default:
                    return 0;
            }
        }
    }), _utils.setPrivateProp).call(_context, {
        children: [],
        parents: [],
        isDraging: false,
        overscrollBack: false,
        isNestedScrollbar: false,
        touchRecord: new _helpers.TouchRecord(),
        scrollListeners: [],
        eventHandlers: [],
        timerID: {},
        size: {
            container: {
                width: 0,
                height: 0
            },
            content: {
                width: 0,
                height: 0
            }
        },
        offset: {
            x: 0,
            y: 0
        },
        thumbOffset: {
            x: 0,
            y: 0
        },
        limit: {
            x: Infinity,
            y: Infinity
        },
        movement: {
            x: 0,
            y: 0
        },
        movementLocked: {
            x: false,
            y: false
        },
        overscrollRendered: {
            x: 0,
            y: 0
        },
        thumbSize: {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0
        },
        bounding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    });

    // private methods
    _utils.definePrivateMethod.call(this, {
        hideTrackDebounce: (0, _helpers.debounce)(_apis.hideTrack.bind(this), 1000, false),
        updateDebounce: (0, _helpers.debounce)(_apis.update.bind(this))
    });
}