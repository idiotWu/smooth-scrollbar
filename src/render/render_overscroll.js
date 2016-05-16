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
        next -= (dest / Math.abs(dest || 1));
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

function __renderOverscroll(dirs = []) {
    if (!dirs.length || !this.options.overscrollEffect) return;

    const {
        options,
        offset,
        overscrollRendered
    } = this;

    const lastRendered = { ...overscrollRendered };

    dirs.forEach((dir) => this::calcNext(dir));

    if (overscrollRendered.x === lastRendered.x &&
        overscrollRendered.y === lastRendered.y) return;

    switch (options.overscrollEffect) {
        case 'iOS':
            return this::iOS(overscrollRendered.x, overscrollRendered.y);
        case 'android':
            return this::android(overscrollRendered.x, overscrollRendered.y);
        default:
            return;
    }
}

function iOS(x, y) {
    const {
        size,
        offset,
        targets,
        thumbSize
    } = this;

    const {
        xAxis,
        yAxis,
        content
    } = targets;

    setStyle(content, {
        '-transform': `translate3d(${-(offset.x + x)}px, ${-(offset.y + y)}px, 0)`
    });

    if (x) {
        const thumbSizeX = thumbSize.x * (size.container.width / (size.container.width + Math.abs(x)));

        setStyle(xAxis.thumb, {
            'width': `${thumbSizeX}px`,
            '-transform': `translate3d(${x < 0 ? 0 : size.container.width - thumbSizeX}px, 0, 0)`
        });
    }

    if (y) {
        const thumbSizeY = thumbSize.y * (size.container.height / (size.container.height + Math.abs(y)));

        setStyle(yAxis.thumb, {
            'height': `${thumbSizeY}px`,
            '-transform': `translate3d(0, ${y < 0 ? 0 : size.container.height - thumbSizeY }px, 0)`
        });
    }
}

function android(x, y) {

}

Object.defineProperty(SmoothScrollbar.prototype, '__renderOverscroll', {
    value: __renderOverscroll,
    writable: true,
    configurable: true
});