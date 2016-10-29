'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleTouchEvents = handleTouchEvents;

var _contants = require('../../contants/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _overscroll = require('../overscroll/');

var _render = require('../render/');

var MIN_VELOCITY = 100;

var activeScrollbar = null;

/**
 * Touch events handler
 * @private
 */
function handleTouchEvents() {
    var _this = this;

    var _ref = _utils.getPrivateProp.call(this);

    var targets = _ref.targets;
    var movementLocked = _ref.movementLocked;
    var touchRecord = _ref.touchRecord;
    var container = targets.container;


    _dom.addEvent.call(this, container, 'touchstart', function (evt) {
        if (_utils.getPrivateProp.call(_this, 'isDraging')) return;

        var _ref2 = _utils.getPrivateProp.call(_this);

        var timerID = _ref2.timerID;
        var movement = _ref2.movement;

        // stop scrolling but keep movement for overscrolling

        cancelAnimationFrame(timerID.scrollTo);
        if (!_overscroll.willOverscroll.call(_this, 'x')) movement.x = 0;
        if (!_overscroll.willOverscroll.call(_this, 'y')) movement.y = 0;

        // start records
        touchRecord.track(evt);
        _render.autoLockMovement.call(_this);
    });

    _dom.addEvent.call(this, container, 'touchmove', function (evt) {
        if (_utils.getPrivateProp.call(_this, 'isDraging')) return;
        if (activeScrollbar && activeScrollbar !== _this) return;

        touchRecord.update(evt);

        var _touchRecord$getDelta = touchRecord.getDelta();

        var x = _touchRecord$getDelta.x;
        var y = _touchRecord$getDelta.y;


        if (_render.shouldPropagateMovement.call(_this, x, y)) {
            return _utils.callPrivateMethod.call(_this, 'updateThrottle');
        }

        var _ref3 = _utils.getPrivateProp.call(_this);

        var movement = _ref3.movement;
        var options = _ref3.options;
        var MAX_OVERSCROLL = _ref3.MAX_OVERSCROLL;


        if (movement.x && _overscroll.willOverscroll.call(_this, 'x', x)) {
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
        if (movement.y && _overscroll.willOverscroll.call(_this, 'y', y)) {
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

        _render.autoLockMovement.call(_this);

        evt.preventDefault();

        _render.addMovement.call(_this, x, y, true);
        activeScrollbar = _this;
    });

    _dom.addEvent.call(this, container, 'touchcancel touchend', function (evt) {
        if (_utils.getPrivateProp.call(_this, 'isDraging')) return;

        var _ref4 = _utils.getPrivateProp.call(_this, 'options');

        var speed = _ref4.speed;

        var _touchRecord$getVeloc = touchRecord.getVelocity();

        var x = _touchRecord$getVeloc.x;
        var y = _touchRecord$getVeloc.y;


        x = movementLocked.x ? 0 : Math.min(x * _contants.GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * _contants.GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        _render.addMovement.call(_this, Math.abs(x) > MIN_VELOCITY ? x * speed : 0, Math.abs(y) > MIN_VELOCITY ? y * speed : 0, true);

        _render.unlockMovement.call(_this);
        touchRecord.release(evt);
        activeScrollbar = null;
    });
};