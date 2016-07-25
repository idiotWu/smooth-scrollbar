'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

var _shared = require('../shared/');

/**
 * @module
 * @prototype {Function} __touchHandler
 */

var MIN_VELOCITY = 100;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
function __touchHandler() {
    var _this = this;

    var targets = this.targets;
    var movementLocked = this.movementLocked;
    var container = targets.container;


    var currentTouchID = undefined;

    this.__addEvent(container, 'touchstart', function (evt) {
        if (_this.__isDrag) return;

        var __timerID = _this.__timerID;
        var movement = _this.movement;

        // stop scrolling but keep movement for overscrolling

        cancelAnimationFrame(__timerID.scrollTo);
        if (!_this.__isOntoEdge('x')) movement.x = 0;
        if (!_this.__isOntoEdge('y')) movement.y = 0;

        // start records
        currentTouchID = _shared.GLOBAL_TOUCHES.start(evt);
        _this.__autoLockMovement();
    });

    this.__addEvent(container, 'touchmove', function (evt) {
        if (_this.__isDrag) return;

        if (!_shared.GLOBAL_TOUCHES.isActiveTouch(evt)) return;

        if (_shared.GLOBAL_TOUCHES.hasActiveScrollbar() && !_shared.GLOBAL_TOUCHES.isActiveScrollbar(_this)) return;

        var _GLOBAL_TOUCHES$updat = _shared.GLOBAL_TOUCHES.update(evt);

        var x = _GLOBAL_TOUCHES$updat.x;
        var y = _GLOBAL_TOUCHES$updat.y;


        if (_this.__shouldPropagateMovement(x, y)) {
            return _this.__updateThrottle();
        }

        var movement = _this.movement;
        var MAX_OVERSCROLL = _this.MAX_OVERSCROLL;
        var options = _this.options;


        if (movement.x && _this.__isOntoEdge('x', x)) {
            var factor = 2;
            if (options.overscrollEffect === 'bounce') factor += Math.abs(8 * movement.x / MAX_OVERSCROLL);

            x /= factor;
        }
        if (movement.y && _this.__isOntoEdge('y', y)) {
            var _factor = 2;
            if (options.overscrollEffect === 'bounce') _factor += Math.abs(8 * movement.y / MAX_OVERSCROLL);

            y /= _factor;
        }

        _this.__autoLockMovement();

        evt.preventDefault();

        _this.__addMovement(x, y);
        _shared.GLOBAL_TOUCHES.setActiveScrollbar(_this);
    });

    this.__addEvent(container, 'touchend blur', function () {
        if (_this.__isDrag) return;

        if (!_shared.GLOBAL_TOUCHES.isActiveScrollbar(_this)) return;

        var speed = _this.options.speed;

        var _GLOBAL_TOUCHES$getVe = _shared.GLOBAL_TOUCHES.getVelocity();

        var x = _GLOBAL_TOUCHES$getVe.x;
        var y = _GLOBAL_TOUCHES$getVe.y;


        x = movementLocked.x ? 0 : Math.min(x * _shared.GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * _shared.GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        _this.__addMovement(Math.abs(x) > MIN_VELOCITY ? x * speed : 0, Math.abs(y) > MIN_VELOCITY ? y * speed : 0);

        _this.__unlockMovement();
        _shared.GLOBAL_TOUCHES.release(currentTouchID);
    });
};

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});