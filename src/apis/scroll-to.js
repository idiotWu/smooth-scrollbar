/**
 * @module
 * @prototype {Function} scrollTo
 */

import { pickInRange, buildCurve } from '../utils/';
import { SmoothScrollbar } from '../smooth-scrollbar';

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
SmoothScrollbar.prototype.scrollTo = function (
    x = this.offset.x,
    y = this.offset.y,
    duration = 0, cb = null,
) {
    const {
        options,
        offset,
        limit,
        __timerID,
    } = this;

    cancelAnimationFrame(__timerID.scrollTo);
    cb = typeof cb === 'function' ? cb : () => {};

    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    const startX = offset.x;
    const startY = offset.y;

    const disX = pickInRange(x, 0, limit.x) - startX;
    const disY = pickInRange(y, 0, limit.y) - startY;

    const curveX = buildCurve(disX, duration);
    const curveY = buildCurve(disY, duration);

    const totalFrame = curveX.length;
    let frame = 0;

    const scroll = () => {
        if (frame === totalFrame) {
            this.setPosition(x, y);

            return requestAnimationFrame(() => {
                cb(this);
            });
        }

        this.setPosition(startX + curveX[frame], startY + curveY[frame]);

        frame++;

        __timerID.scrollTo = requestAnimationFrame(scroll);
    };

    scroll();
};
