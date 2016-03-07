/**
 * @module
 * @prototype {Function} __setMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __setMovement(deltaX = 0, deltaY = 0) {
    const { movement, options } = this;

    movement.x = (deltaX * options.speed);
    movement.y = (deltaY * options.speed);
};

Object.defineProperty(SmoothScrollbar.prototype, '__setMovement', {
    value: __setMovement,
    writable: true,
    configurable: true
});