/**
 * @module
 * @prototype {Function} __scrollOntoEdge
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { pickInRange } from '../utils/';

export { SmoothScrollbar };

function __scrollOntoEdge(deltaX, deltaY) {
    const { offset, limit } = this;

    let destX = pickInRange(deltaX + offset.x, 0, limit.x);
    let destY = pickInRange(deltaY + offset.y, 0, limit.y);

    if (destX === offset.x && destY === offset.y) {
        return true;
    }

    return false;
};

Object.defineProperty(SmoothScrollbar.prototype, '__scrollOntoEdge', {
    value: __scrollOntoEdge,
    writable: true,
    configurable: true
});