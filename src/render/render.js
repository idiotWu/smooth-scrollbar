/**
 * @module
 * @prototype {Function} __render
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { pickInRange } from '../utils/';

// @this-bind
function nextTick(dir) {
    const {
        options,
        offset,
        movement,
        __touchRecord,
    } = this;

    const {
        damping,
        renderByPixels,
        overscrollDamping,
    } = options;

    const current = offset[dir];
    const remain = movement[dir];

    let renderDamping = damping;

    if (this.__willOverscroll(dir, remain)) {
        renderDamping = overscrollDamping;
    } else if (__touchRecord.isActive()) {
        renderDamping = 0.5;
    }

    if (Math.abs(remain) < 1) {
        let next = current + remain;

        return {
            movement: 0,
            position: remain > 0 ? Math.ceil(next) : Math.floor(next),
        };
    }

    let nextMovement = remain * (1 - renderDamping);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + remain - nextMovement,
    };
};

function __render() {
    const {
        options,
        offset,
        limit,
        movement,
        overscrollRendered,
        __timerID,
    } = this;

    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        const nextX = this::nextTick('x');
        const nextY = this::nextTick('y');
        const overflowDir = [];

        if (options.overscrollEffect) {
            const destX = pickInRange(nextX.position, 0, limit.x);
            const destY = pickInRange(nextY.position, 0, limit.y);

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
    configurable: true,
});
