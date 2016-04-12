/**
 * @module
 * @prototype {Function} setPosition
 */

import { pickInRange, setStyle } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Set scrollbar position without transition
 *
 * @param {Number} [x]: scrollbar position in x axis
 * @param {Number} [y]: scrollbar position in y axis
 * @param {Boolean} [withoutCallbacks]: disable callback functions temporarily
 */
SmoothScrollbar.prototype.setPosition = function(x = this.offset.x, y = this.offset.y, withoutCallbacks = false) {
    this.__updateThrottle();

    const status = {};
    const { offset, limit, targets, __listeners } = this;

    if (Math.abs(x - offset.x) > 1) this.showTrack('x');
    if (Math.abs(y - offset.y) > 1) this.showTrack('y');

    x = pickInRange(x, 0, limit.x);
    y = pickInRange(y, 0, limit.y);

    this.hideTrack();

    if (x === offset.x && y === offset.y) return;

    status.direction = {
        x: x === offset.x ? 'none' : (x > offset.x ? 'right' : 'left'),
        y: y === offset.y ? 'none' : (y > offset.y ? 'down' : 'up')
    };

    status.limit = { ...limit };

    offset.x = x;
    offset.y = y;
    status.offset = { ...offset };

    // reset thumb position after offset update
    this.__setThumbPosition();

    setStyle(targets.content, {
        '-transform': `translate3d(${-x}px, ${-y}px, 0)`
    });

    // invoke all listeners
    if (withoutCallbacks) return;
    __listeners.forEach((fn) => {
        requestAnimationFrame(() => {
            fn(status);
        });
    });
};