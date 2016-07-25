/**
 * @module
 * @prototype {Function} __isOntoEdge
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { pickInRange } from '../utils/';

// check if scrollbar scrolls onto very edge in particular direction
function __isOntoEdge(dir = '', delta = 0) {
    if (!dir) return false;

    const {
        offset,
        limit
    } = this;

    const currentOffset = offset[dir];

    return pickInRange(delta + currentOffset, 0, limit[dir]) === currentOffset &&
        (currentOffset === 0 || currentOffset === limit[dir]);
};

Object.defineProperty(SmoothScrollbar.prototype, '__isOntoEdge', {
    value: __isOntoEdge,
    writable: true,
    configurable: true
});
