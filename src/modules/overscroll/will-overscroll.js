/**
 * @module
 * @prototype {Function} __willOverscroll
 */

import {
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../namespace/';

/**
 * Check if scrollbar scrolls onto very edge in particular direction
 * @private
 * @param {string} dir - Direction to be check
 * @param {number} delta - Next delta value
 * @return {boolean}
 */
export function willOverscroll(dir = '', delta = 0) {
    if (!dir) return false;

    const {
        offset,
        limit,
    } = this::getPrivateProp();

    const currentOffset = offset[dir];

    // cond:
    //  1. next scrolling position is supposed to stay unchange
    //  2. current position is on the edge
    return pickInRange(delta + currentOffset, 0, limit[dir]) === currentOffset &&
        (currentOffset === 0 || currentOffset === limit[dir]);
};
