/**
 * @module
 * @prototype {Function} __setMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __setMovement(...args) {
    const { movement } = this;

    let [deltaX, deltaY] = this.__transformDelta(args);
    movement.x = deltaX;
    movement.y = deltaY;
};

Object.defineProperty(SmoothScrollbar.prototype, '__setMovement', {
    value: __setMovement,
    writable: true,
    configurable: true
});