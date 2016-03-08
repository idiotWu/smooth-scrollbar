/**
 * @module
 * @prototype {Function} __getDeltaLimit
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __getDeltaLimit() {
    const {
        offset,
        limit
    } = this;

    return {
        x: [-offset.x, limit.x - offset.x],
        y: [-offset.y, limit.y - offset.y]
    };
};

Object.defineProperty(SmoothScrollbar.prototype, '__getDeltaLimit', {
    value: __getDeltaLimit,
    writable: true,
    configurable: true
});