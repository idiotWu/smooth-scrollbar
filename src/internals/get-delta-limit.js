/**
 * @module
 * @prototype {Function} __getDeltaLimit
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

function __getDeltaLimit() {
    const {
        options,
        offset,
        limit,
    } = this;

    if (options.continuousScrolling || options.overscrollEffect) {
        return {
            x: [-Infinity, Infinity],
            y: [-Infinity, Infinity],
        };
    }

    return {
        x: [-offset.x, limit.x - offset.x],
        y: [-offset.y, limit.y - offset.y],
    };
};

Object.defineProperty(SmoothScrollbar.prototype, '__getDeltaLimit', {
    value: __getDeltaLimit,
    writable: true,
    configurable: true,
});
