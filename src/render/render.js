/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { GLOBAL_TOUCHES } from '../shared/';
import { pickInRange } from '../utils/';

export { SmoothScrollbar };

function nextTick(scrollbar, options, current, movement) {
    let { friction, renderByPixels } = options;

    if (GLOBAL_TOUCHES.isActiveScrollbar(scrollbar)) {
        friction = 40;
    }

    if (Math.abs(movement) < 1) {
        let next = current + movement;

        return {
            movement: 0,
            position: movement > 0 ? Math.ceil(next) : Math.floor(next)
        };
    }

    let nextMovement = movement * (1 - friction / 100);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + movement - nextMovement
    };
};

function __render() {
    const {
        options,
        offset,
        limit,
        movement,
        overscrollRendered,
        __timerID
    } = this;

    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        let nextX = nextTick(this, options, offset.x, movement.x);
        let nextY = nextTick(this, options, offset.y, movement.y);
        let overflowDir = [];

        if (options.overscrollEffect) {
            let destX = pickInRange(nextX.position, 0, limit.x);
            let destY = pickInRange(nextY.position, 0, limit.y);

            // overscroll is rendering
            // or scrolling onto particular edge
            if (overscrollRendered.x ||
                (destX === offset.x && movement.x)) {
                overflowDir.push('x');
            }

            if (overscrollRendered.y ||
                (destY === offset.y && movement.y)) {
                overflowDir.push('y');
            }
        }

        if (!this.movementLocked.x) movement.x = nextX.movement;
        if (!this.movementLocked.y) movement.y = nextY.movement;

        this.setPosition(nextX.position, nextY.position);
        this.__renderOverscroll(overflowDir);
    }

    __timerID.render = requestAnimationFrame(this::__render);
};

Object.defineProperty(SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});