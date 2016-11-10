'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

// @this-bind
/**
 * @module
 * @prototype {Function} __render
 */

function nextTick(dir) {
    var options = this.options,
        offset = this.offset,
        movement = this.movement,
        __touchRecord = this.__touchRecord;
    var damping = options.damping,
        renderByPixels = options.renderByPixels,
        overscrollDamping = options.overscrollDamping;


    var current = offset[dir];
    var remain = movement[dir];

    var renderDamping = damping;

    if (this.__willOverscroll(dir, remain)) {
        renderDamping = overscrollDamping;
    } else if (__touchRecord.isActive()) {
        renderDamping = 0.5;
    }

    if (Math.abs(remain) < 1) {
        var next = current + remain;

        return {
            movement: 0,
            position: remain > 0 ? Math.ceil(next) : Math.floor(next)
        };
    }

    var nextMovement = remain * (1 - renderDamping);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + remain - nextMovement
    };
};

function __render() {
    var options = this.options,
        offset = this.offset,
        limit = this.limit,
        movement = this.movement,
        overscrollRendered = this.overscrollRendered,
        __timerID = this.__timerID;


    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        var nextX = nextTick.call(this, 'x');
        var nextY = nextTick.call(this, 'y');
        var overflowDir = [];

        if (options.overscrollEffect) {
            var destX = (0, _utils.pickInRange)(nextX.position, 0, limit.x);
            var destY = (0, _utils.pickInRange)(nextY.position, 0, limit.y);

            // overscroll is rendering
            // or scrolling onto particular edge
            if (overscrollRendered.x || destX === offset.x && movement.x) {
                overflowDir.push('x');
            }

            if (overscrollRendered.y || destY === offset.y && movement.y) {
                overflowDir.push('y');
            }
        }

        if (!this.movementLocked.x) movement.x = nextX.movement;
        if (!this.movementLocked.y) movement.y = nextY.movement;

        this.setPosition(nextX.position, nextY.position);
        this.__renderOverscroll(overflowDir);
    }

    __timerID.render = requestAnimationFrame(__render.bind(this));
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});