/**
 * @module
 * @prototype {Function} __renderOverscroll
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

import { overscrollBounce, overscrollGlow } from '../overscroll/';
import { pickInRange } from '../utils/';

export { SmoothScrollbar };

// @this-binding
function calcNext(dir = '') {
    if (!dir) return;

    const {
        options,
        movement,
        overscrollRendered,
        MAX_OVERSCROLL
    } = this;

    const dest = movement[dir] = pickInRange(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);
    const friction = options.friction / 100 * (this.overscrollBack ? 5 : 2);

    let next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) * friction;

    if (options.renderByPixels) {
        next |= 0;
    }

    if (Math.abs(next - overscrollRendered[dir]) < 0.1) {
        next -= (dest / Math.abs(dest || 1));
    }

    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
        this.__readonly('overscrollBack', true);
    }

    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
        next = 0;
        this.__readonly('overscrollBack', false);
    }

    overscrollRendered[dir] = next;
}

// @this-binding
function __renderOverscroll(dirs = []) {
    if (!dirs.length || !this.options.overscrollEffect) return;

    const {
        options,
        offset,
        overscrollRendered
    } = this;

    const lastRendered = { ...overscrollRendered };

    dirs.forEach((dir) => this::calcNext(dir));

    if (overscrollRendered.x === lastRendered.x &&
        overscrollRendered.y === lastRendered.y) return;

    // x,y is same direction as it's in `setPosition(x, y)`
    switch (options.overscrollEffect) {
        case 'bounce':
            return this::overscrollBounce(overscrollRendered.x, overscrollRendered.y);
        case 'glow':
            return this::overscrollGlow(overscrollRendered.x, overscrollRendered.y);
        default:
            return;
    }
}

Object.defineProperty(SmoothScrollbar.prototype, '__renderOverscroll', {
    value: __renderOverscroll,
    writable: true,
    configurable: true
});