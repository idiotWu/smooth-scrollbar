/**
 * @module
 * @prototype {Function} __speedUp
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __speedUp(x = 0, y = 0) {
    const { speed } = this.options;

    this.velocity.x += (x * speed);
    this.velocity.y += (y * speed);
};

Object.defineProperty(SmoothScrollbar.prototype, '__speedUp', {
    value: __speedUp,
    writable: true,
    configurable: true
});