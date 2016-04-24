/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function nextTick(options, current, movement) {
    const { friction, renderByPixels } = options;

    if (Math.abs(movement) < 1) {
        let next = current + movement;

        return {
            movement: 0,
            position: movement > 0 ? Math.ceil(next) : Math.floor(next)
        };
    }

    let q = 1 - friction / 100;

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
        __timerID
    } = this;

    if (movement.x || movement.y) {
        let nextX = nextTick(options, offset.x, movement.x);
        let nextY = nextTick(options, offset.y, movement.y);

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