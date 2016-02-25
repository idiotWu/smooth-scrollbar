/**
 * @module
 * @prototype {Function} __addMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __addMovement(deltaX = 0, deltaY = 0) {
    const { movement, options } = this;

    movement.x += (deltaX * options.speed);
    movement.y += (deltaY * options.speed);
};

Object.defineProperty(SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});