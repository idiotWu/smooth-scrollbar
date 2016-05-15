/**
 * @module
 * @prototype {Function} __scrollOntoEdge
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { pickInRange } from '../utils/';

export { SmoothScrollbar };

function __scrollOntoEdge(deltaX = 0, deltaY = 0) {
    const { offset, limit } = this;

    let destX = pickInRange(deltaX + offset.x, 0, limit.x);
    let destY = pickInRange(deltaY + offset.y, 0, limit.y);
    let res = true;

    // offset not about to change
    res &= (destX === offset.x);
    res &= (destY === offset.y);

    // current offset is on the edge
    res &= (destX === limit.x || destX === 0);
    res &= (destY === limit.y || destY === 0);

    return !!res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__scrollOntoEdge', {
    value: __scrollOntoEdge,
    writable: true,
    configurable: true
});