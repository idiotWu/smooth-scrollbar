'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

var _shared = require('../shared/');

var _utils = require('../utils/');

var MIN_VELOCITY = 100; /**
                         * @module
                         * @prototype {Function} __touchHandler
                         */

var activeScrollbar = null;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
function __touchHandler() {
    var _this = this;

    var targets = this.targets,
        __touchRecord = this.__touchRecord;
    var container = targets.container;


    this.__addEvent(container, 'touchstart', function (evt) {
        if (_this.__isDrag) return;

        var __timerID = _this.__timerID,
            movement = _this.movement;

        // stop scrolling but keep movement for overscrolling

        cancelAnimationFrame(__timerID.scrollTo);
        if (!_this.__willOverscroll('x')) movement.x = 0;
        if (!_this.__willOverscroll('y')) movement.y = 0;

        // start records
        __touchRecord.track(evt);
        _this.__autoLockMovement();
    });

    this.__addEvent(container, 'touchmove', function (evt) {
        if (_this.__isDrag) return;
        if (activeScrollbar && activeScrollbar !== _this) return;

        __touchRecord.update(evt);

        var _touchRecord$getDelt = __touchRecord.getDelta(),
            x = _touchRecord$getDelt.x,
            y = _touchRecord$getDelt.y;

        if (_this.__shouldPropagateMovement(x, y)) {
            return _this.__updateThrottle();
        }

        var movement = _this.movement,
            MAX_OVERSCROLL = _this.MAX_OVERSCROLL,
            options = _this.options;


        if (movement.x && _this.__willOverscroll('x', x)) {
            var factor = 2;

            if (options.overscrollEffect === 'bounce') {
                factor += Math.abs(10 * movement.x / MAX_OVERSCROLL);
            }

            if (Math.abs(movement.x) >= MAX_OVERSCROLL) {
                x = 0;
            } else {
                x /= factor;
            }
        }
        if (movement.y && _this.__willOverscroll('y', y)) {
            var _factor = 2;

            if (options.overscrollEffect === 'bounce') {
                _factor += Math.abs(10 * movement.y / MAX_OVERSCROLL);
            }

            if (Math.abs(movement.y) >= MAX_OVERSCROLL) {
                y = 0;
            } else {
                y /= _factor;
            }
        }

        _this.__autoLockMovement();

        evt.preventDefault();

        _this.__addMovement(x, y, true);
        activeScrollbar = _this;
    });

    this.__addEvent(container, 'touchcancel touchend', function (evt) {
        if (_this.__isDrag) return;

        var speed = _this.options.speed;


        var velocity = __touchRecord.getVelocity();
        var movement = {};

        (0, _keys2.default)(velocity).forEach(function (dir) {
            var value = (0, _utils.pickInRange)(velocity[dir] * _shared.GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

            // throw small values
            movement[dir] = Math.abs(value) > MIN_VELOCITY ? value * speed : 0;
        });

        _this.__addMovement(movement.x, movement.y, true);

        _this.__unlockMovement();
        __touchRecord.release(evt);
        activeScrollbar = null;
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});