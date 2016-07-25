/**
 * @module
 * @prototype {Function} __getPointerTrend
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { getPosition } from '../utils/';

function __getPointerTrend(evt, padding = 0) {
    const { top, right, bottom, left } = this.bounding;
    const { x, y } = getPosition(evt);

    const res = {
        x: 0,
        y: 0,
    };

    if (x === 0 && y === 0) return res;

    if (x > right - padding) {
        res.x = (x - right + padding);
    } else if (x < left + padding) {
        res.x = (x - left - padding);
    }

    if (y > bottom - padding) {
        res.y = (y - bottom + padding);
    } else if (y < top + padding) {
        res.y = (y - top - padding);
    }

    return res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__getPointerTrend', {
    value: __getPointerTrend,
    writable: true,
    configurable: true,
});
