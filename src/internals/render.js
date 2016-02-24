/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function nextTick(options, curPos, curV) {
    const {
        fricton,
        inflection,
        sensitivity
    } = options;

    let reduceAmout = curV / Math.abs(curV) * sensitivity || 0;

    if (Math.abs(curV) <= inflection) {
        // slow down
        reduceAmout /= 10;
    }

    let nextV = curV * (1 - fricton / 100) - reduceAmout;
    let nextPos = curPos + curV;

    if (curV * nextV < 0) {
        // stop at integer position
        if (curV > nextV) {
            nextPos = Math.ceil(nextPos);
        } else {
            nextPos = Math.floor(nextPos);
        }

        nextV = 0;
    }

    return {
        position: nextPos,
        velocity: nextV
    };
};


function __render() {
    const {
        options,
        offset,
        velocity,
        __timerID
    } = this;

    if (velocity.x || velocity.y) {
        let nextX = nextTick(options, offset.x, velocity.x);
        let nextY = nextTick(options, offset.y, velocity.y);

        velocity.x = nextX.velocity;
        velocity.y = nextY.velocity;

        this.setPosition(nextX.position, nextY.position);
    }

    __timerID.scrollAnimation = requestAnimationFrame(this::__render);

};

Object.defineProperty(SmoothScrollbar.prototype, '__render', {
    value: __render,
    writable: true,
    configurable: true
});