/**
 * @module
 * @prototype {Function} __getOverflowDir
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getPosition } from '../utils/index';


export { SmoothScrollbar };

function __getOverflowDir(evt) {
    const { bounding } = this;
    const { x, y } = getPosition(evt);
    const res = {
        x: 0,
        y: 0
    };

    if (x > bounding.right) {
        res.x = (x - bounding.right) / 100;
    } else if (x < bounding.left) {
        res.x = (x - bounding.left) / 100;
    }

    if (y > bounding.bottom) {
        res.y = (y - bounding.bottom) / 100;
    } else if (y < bounding.top) {
        res.y = (y - bounding.top) / 100;
    }

    return res;
};

Object.defineProperty(SmoothScrollbar.prototype, '__getOverflowDir', {
    value: __getOverflowDir,
    writable: true,
    configurable: true
});