/**
 * @module
 * @prototype {Function} infiniteScroll
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @api
 * Create infinite scroll listener
 *
 * @param {Function} cb: infinite scroll action
 * @param {Number} [threshold]: infinite scroll threshold(to bottom), default is 50(px)
 */
SmoothScrollbar.prototype.infiniteScroll = function (cb, threshold = 50) {
    if (typeof cb !== 'function') return;

    let lastOffset = {
        x: 0,
        y: 0,
    };

    let entered = false;

    this.addListener((status) => {
        const { offset, limit } = status;

        if (limit.y - offset.y <= threshold && offset.y > lastOffset.y && !entered) {
            entered = true;
            setTimeout(() => cb(status));
        }

        if (limit.y - offset.y > threshold) {
            entered = false;
        }

        lastOffset = offset;
    });
};
