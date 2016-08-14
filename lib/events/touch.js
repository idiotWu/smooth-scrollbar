'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _shared = require('../shared/');

/**
 * @module
 * @prototype {Function} __touchHandler
 */

var MIN_VELOCITY = 100;

var activeScrollbar = null;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
function __touchHandler() {
    var _this = this;

    var targets = this.targets;
    var movementLocked = this.movementLocked;
    var __touchRecord = this.__touchRecord;
    var container = targets.container;


    this.__addEvent(container, 'touchstart', function (evt) {
        if (_this.__isDrag) return;

        var __timerID = _this.__timerID;
        var movement = _this.movement;

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

        var _touchRecord$getDelt = __touchRecord.getDelta();

        var x = _touchRecord$getDelt.x;
        var y = _touchRecord$getDelt.y;


        if (_this.__shouldPropagateMovement(x, y)) {
            return _this.__updateThrottle();
        }

        var movement = _this.movement;
        var MAX_OVERSCROLL = _this.MAX_OVERSCROLL;
        var options = _this.options;


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

        _this.__addMovement(x, y);
        activeScrollbar = _this;
    });

    this.__addEvent(container, 'touchcancel touchend', function (evt) {
        if (_this.__isDrag) return;

        var speed = _this.options.speed;

        var _touchRecord$getVelo = __touchRecord.getVelocity();

        var x = _touchRecord$getVelo.x;
        var y = _touchRecord$getVelo.y;


        x = movementLocked.x ? 0 : Math.min(x * _shared.GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * _shared.GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        _this.__addMovement(Math.abs(x) > MIN_VELOCITY ? x * speed : 0, Math.abs(y) > MIN_VELOCITY ? y * speed : 0);

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