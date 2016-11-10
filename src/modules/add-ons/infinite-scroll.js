import {
    addListener,
} from '../render/';

/**
 * Create infinite scroll listener
 * @public
 * @param {function} cb - infinite scroll action
 * @param {number} [threshold=50] - infinite scroll threshold(to bottom), default is 50(px)
 */
export function infiniteScroll(cb, threshold = 50) {
    if (typeof cb !== 'function') return;

    let lastOffset = {
        x: 0,
        y: 0,
    };

    let entered = false;

    this::addListener((status) => {
        const {
            offset,
            limit,
        } = status;

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
