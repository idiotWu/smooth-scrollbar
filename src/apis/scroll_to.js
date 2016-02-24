/**
 * @module
 * @prototype {Function} scrollTo
 */

import { pickInRange } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Scrolling scrollbar to position with transition
 *
 * @param {Number} [x]: scrollbar position in x axis
 * @param {Number} [y]: scrollbar position in y axis
 * @param {Number} [duration]: transition duration
 * @param {Function} [cb]: callback
 */
SmoothScrollbar.prototype.scrollTo = function(x = this.offset.x, y = this.offset.y, duration = 0, cb = null) {
    const {
        options,
        offset,
        limit,
        velocity,
        __timerID
    } = this;

    cancelAnimationFrame(__timerID.scrollTo);
    cb = typeof cb === 'function' ? cb : () => {};

    const disX = pickInRange(x, 0, limit.x) - offset.x;
    const disY = pickInRange(y, 0, limit.y) - offset.y;

    let frameCount = (disX || disY) && duration / 1000 * 60;
    let eachX = disX / frameCount, eachY = disY / frameCount;

    let scroll = () => {
        if (!frameCount) {
            this.setPosition(x, y);

            return requestAnimationFrame(() => {
                cb(this);
            });
        }

        this.setPosition(
            offset.x + eachX,
            offset.y + eachY
        );

        frameCount--;

        __timerID.scrollTo = requestAnimationFrame(scroll);
    };

    scroll();
};