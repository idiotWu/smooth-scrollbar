/**
 * @module
 * @prototype {Function} __getPointerTrend
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getPosition } from '../utils/';

export { SmoothScrollbar };

function __getPointerTrend(evt, edge = 0) {
    const { top, right, bottom, left } = this.bounding;
    const { x, y } = getPosition(evt);

    const res = {
        x: 0,
        y: 0
    };

    if (x === 0 && y === 0) return res;

    if (x > right - edge) {
        res.x = (x - right + edge);
    } else if (x < left + edge) {
        res.x = (x - left - edge);
    }

    if (y > bottom - edge) {
        res.y = (y - bottom + edge);
    } else if (y < top + edge) {
        res.y = (y - top - edge);
    }

    return res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__getPointerTrend', {
    value: __getPointerTrend,
    writable: true,
    configurable: true
});