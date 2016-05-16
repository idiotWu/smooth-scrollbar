/**
 * @module
 * @prototype {Function} __propagateMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { pickInRange } from '../utils/';

export { SmoothScrollbar };

function __propagateMovement(deltaX = 0, deltaY = 0) {
    const { options, offset, limit } = this;

    if (!options.continuousScrolling || options.overscrollEffect) return false;

    let destX = pickInRange(deltaX + offset.x, 0, limit.x);
    let destY = pickInRange(deltaY + offset.y, 0, limit.y);
    let res = true;

    // offset not about to change
    res &= (destX === offset.x);
    res &= (destY === offset.y);

    // current offset is on the edge
    res &= (destX === limit.x || destX === 0 || destY === limit.y || destY === 0);

    return !!res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__propagateMovement', {
    value: __propagateMovement,
    writable: true,
    configurable: true
});