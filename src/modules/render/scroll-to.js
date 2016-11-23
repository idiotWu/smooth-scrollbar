import {
    pickInRange,
    buildCurve,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../namespace/';

import { setPosition } from './set-position';

/**
 * Scrolling scrollbar to position with transition
 * @public
 * @api
 * @param {number} [x] - scrollbar position in x axis
 * @param {number} [y] - scrollbar position in y axis
 * @param {number} [duration] - transition duration
 * @param {function} [cb] - callback
 */
export function scrollTo(
    x = this::getPrivateProp('offset').x,
    y = this::getPrivateProp('offset').y,
    duration = 0,
    cb = null,
) {
    const {
        options,
        offset,
        limit,
        timerID,
    } = this::getPrivateProp();

    cancelAnimationFrame(timerID.scrollTo);
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
            this::setPosition(x, y);

            return requestAnimationFrame(() => {
                cb(this);
            });
        }

        this::setPosition(startX + curveX[frame], startY + curveY[frame]);

        frame++;

        timerID.scrollTo = requestAnimationFrame(scroll);
    };

    scroll();
};
