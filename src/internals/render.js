/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function nextTick(options, current, movement) {
    const { fricton } = options;

    let q = 1 - fricton / 100;
    let next = current + movement * (1 - q);
    let remain = movement * q;

    if (Math.abs(remain) < 1) {
        remain = 0;
        next = current > next ? Math.ceil(next) : Math.floor(next); // stop at integer position
    }

    return {
        position: next,
        movement: remain
    };
};

function __render() {
    const {
        options,
        offset,
        limit,
        movement,
        __timerID
    } = this;

    if ((limit.y - offset.y <= 50 && movement.y > 50) ||
        (offset.y <= 50 && movement.y < -50)) {
        movement.y /= 2;
    }

    if ((limit.x - offset.x <= 50 && movement.x > 50) ||
        (offset.x <= 50 && movement.x < -50)) {
        movement.x /= 2;
    }

    if (movement.x || movement.y) {
        let nextX = nextTick(options, offset.x, movement.x);
        let nextY = nextTick(options, offset.y, movement.y);

        movement.x = nextX.movement;
        movement.y = nextY.movement;

        this.setPosition(nextX.position, nextY.position);
    }

    __timerID.scrollAnimation = requestAnimationFrame(this::__render);

};

Object.defineProperty(SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});