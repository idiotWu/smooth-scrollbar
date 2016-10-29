import {
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../utils/';

/**
 * Check whether to propagate movement to outer scrollbars
 * These situations are considered as `true`:
 *         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
 *         2. scrollbar reaches one side and not about to scroll on the other direction
 *
 * @param {number} [deltaX]
 * @param {number} [deltaY]
 * @return {boolean}
 */
export function shouldPropagateMovement(deltaX = 0, deltaY = 0) {
    const {
        options,
        offset,
        limit,
    } = this::getPrivateProp();

    if (!options.continuousScrolling) return false;

    const destX = pickInRange(deltaX + offset.x, 0, limit.x);
    const destY = pickInRange(deltaY + offset.y, 0, limit.y);
    let res = true;

    // offset not about to change
    res &= (destX === offset.x);
    res &= (destY === offset.y);

    // current offset is on the edge
    res &= (destX === limit.x || destX === 0 || destY === limit.y || destY === 0);

    return res;
};
