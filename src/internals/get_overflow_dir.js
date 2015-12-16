/**
 * @module
 * @prototype {Function} __getOverflowDir
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getPosition } from '../utils/index';

export { SmoothScrollbar };

function __getOverflowDir(evt, edge = 0) {
    const { bounding } = this;
    const { x, y } = getPosition(evt);

    const res = {
        x: 0,
        y: 0
    };

    if (x === 0 && y === 0) return res;

    if (x > bounding.right - edge) {
        res.x = (x - bounding.right + edge) / 100;
    } else if (x < bounding.left + edge) {
        res.x = (x - bounding.left - edge) / 100;
    }

    if (y > bounding.bottom - edge) {
        res.y = (y - bounding.bottom + edge) / 100;
    } else if (y < bounding.top + edge) {
        res.y = (y - bounding.top - edge) / 100;
    }

    return res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__getOverflowDir', {
    value: __getOverflowDir,
    writable: true,
    configurable: true
});