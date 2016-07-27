/**
 * @module
 * @prototype {Function} __willOverscroll
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { pickInRange } from '../utils/';

// check if scrollbar scrolls onto very edge in particular direction
function __willOverscroll(dir = '', delta = 0) {
    if (!dir) return false;

    const {
        offset,
        limit,
    } = this;

    const currentOffset = offset[dir];

    // cond:
    //  1. next scrolling position is supposed to stay unchange
    //  2. current position is on the edge
    return pickInRange(delta + currentOffset, 0, limit[dir]) === currentOffset &&
        (currentOffset === 0 || currentOffset === limit[dir]);
};

Object.defineProperty(SmoothScrollbar.prototype, '__willOverscroll', {
    value: __willOverscroll,
    writable: true,
    configurable: true,
});
