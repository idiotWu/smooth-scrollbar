/**
 * @module
 * @prototype {Function} __renderOverscroll
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

import { overscrollBounce, overscrollGlow } from '../overscroll/';
import { GLOBAL_TOUCHES } from '../shared/';
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

    if (!this.__isMovementLocked() && Math.abs(next - overscrollRendered[dir]) < 0.1) {
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

// @this-bind
function shouldUpdate(lastRendered) {
    const {
        overscrollRendered
    } = this;

    // has unrendered pixels?
    if (overscrollRendered.x !== lastRendered.x ||
        overscrollRendered.y !== lastRendered.y) return true;

    // is touch position updated?
    if (GLOBAL_TOUCHES.TOUCH_SUPPORTED &&
        GLOBAL_TOUCHES.isActiveScrollbar(this) &&
        GLOBAL_TOUCHES.updatedRecentlly()) return true;

    return false;
}

// @this-binding
function __renderOverscroll(dirs = []) {
    if (!dirs.length || !this.options.overscrollEffect) return;

    const {
        options,
        overscrollRendered
    } = this;

    const lastRendered = { ...overscrollRendered };

    dirs.forEach((dir) => this::calcNext(dir));

    if (!this::shouldUpdate(lastRendered)) return;

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