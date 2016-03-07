/**
 * @module
 * @prototype {Function} __transformDelta
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __transformDelta([deltaX = 0, deltaY = 0] = []) {
    const {
        offset,
        limit,
        movement,
        options
    } = this;

    deltaX *= options.speed;
    deltaY *= options.speed;

    deltaX = deltaX > 0 ? Math.min(deltaX, limit.x - offset.x) : Math.max(deltaX, -offset.x);
    deltaY = deltaY > 0 ? Math.min(deltaY, limit.y - offset.y) : Math.max(deltaY, -offset.y);

    return [deltaX, deltaY];
};

Object.defineProperty(SmoothScrollbar.prototype, '__transformDelta', {
    value: __transformDelta,
    writable: true,
    configurable: true
});