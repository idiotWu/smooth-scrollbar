/**
 * @module
 * @prototype {Function} __addMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __addMovement(...args) {
    const { movement } = this;

    let [deltaX, deltaY] = this.__transformDelta(args);
    movement.x += deltaX;
    movement.y += deltaY;
};

Object.defineProperty(SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});