'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

var _shared = require('../shared/');

var _utils = require('../utils/');

function nextTick(scrollbar, options, current, movement) {
    var damping = options.damping;
    var renderByPixels = options.renderByPixels;


    var renderDamping = _shared.GLOBAL_TOUCHES.isActiveScrollbar(scrollbar) ? 0.4 : damping;

    if (Math.abs(movement) < 1) {
        var next = current + movement;

        return {
            movement: 0,
            position: movement > 0 ? Math.ceil(next) : Math.floor(next)
        };
    }

    var nextMovement = movement * (1 - renderDamping);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + movement - nextMovement
    };
} /**
   * @module
   * @prototype {Function} __render
   */

;

function __render() {
    var options = this.options;
    var offset = this.offset;
    var limit = this.limit;
    var movement = this.movement;
    var overscrollRendered = this.overscrollRendered;
    var __timerID = this.__timerID;


    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        var nextX = nextTick(this, options, offset.x, movement.x);
        var nextY = nextTick(this, options, offset.y, movement.y);
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

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});