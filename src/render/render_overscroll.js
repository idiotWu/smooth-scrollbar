/**
 * @module
 * @prototype {Function} __renderOverscroll
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { setStyle, pickInRange } from '../utils/';

export { SmoothScrollbar };

const MAX_OVERSCROLL = 100;

// @this-binding
function calcNext(dir = '') {
    if (!dir) return;

    const {
        options,
        movement,
        overscrollRendered
    } = this;

    const dest = movement[dir] = pickInRange(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);

    let next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) / 2;

    if (options.renderByPixels) {
        next |= 0;
    }

    if (next === overscrollRendered[dir]) {
        const dir = (dest / Math.abs(dest)) || 0;
        next -= dir;
    }

    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
        this.__readonly('overscrollBack', true);
    }

    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
        next = 0;
        this.__readonly('overscrollBack', false);
    }

    overscrollRendered[dir] = next;
}

function iOS(x, y) {

}

function android(x, y) {

}

function __renderOverscroll(dirs = []) {
    if (!dirs.length) return;

    const {
        targets,
        offset,
        overscrollRendered
    } = this;

    const lastRendered = { ...overscrollRendered };

    dirs.forEach((dir) => this::calcNext(dir));

    if (overscrollRendered.x === lastRendered.x &&
        overscrollRendered.y === lastRendered.y) return;

    setStyle(targets.content, {
        '-transform': `translate3d(${-(offset.x + overscrollRendered.x)}px, ${-(offset.y + overscrollRendered.y)}px, 0)`
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__renderOverscroll', {
    value: __renderOverscroll,
    writable: true,
    configurable: true
});