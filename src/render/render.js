/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { GLOBAL_TOUCHES } from '../shared/';

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
        movement,
        __timerID,
        __isTouchMoving
    } = this;

    if (movement.x || movement.y) {
        let nextX = nextTick(this, options, offset.x, movement.x, __isTouchMoving);
        let nextY = nextTick(this, options, offset.y, movement.y, __isTouchMoving);

        movement.x = nextX.movement;
        movement.y = nextY.movement;

        this.setPosition(nextX.position, nextY.position);
    }

    __timerID.render = requestAnimationFrame(this::__render);

};

Object.defineProperty(SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});