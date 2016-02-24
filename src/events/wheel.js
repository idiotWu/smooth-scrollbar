/**
 * @module
 * @prototype {Function} __wheelHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getDelta, pickInRange } from '../utils/index';

export { SmoothScrollbar };

// is standard `wheel` event supported check
const WHEEL_EVENT = 'onwheel' in window ? 'wheel' : 'mousewheel';

/**
 * @method
 * @internal
 * Wheel event handler builder
 *
 * @param {Object} option
 *
 * @return {Function}: event handler
 */
let __wheelHandler = function() {
    const { container } = this.targets;

    let lastUpdateTime = Date.now();

    this.__addEvent(container, WHEEL_EVENT, (evt) => {
        if (evt.defaultPrevented) return;

        const { offset, limit } = this;

        const now = Date.now();
        const delta = getDelta(evt);
        const duration = Math.max(16, now - lastUpdateTime); // at least one frame

        lastUpdateTime = now;

        let destX = pickInRange(delta.x + offset.x, 0, limit.x);
        let destY = pickInRange(delta.y + offset.y, 0, limit.y);

        if (Math.abs(destX - offset.x) < 1 && Math.abs(destY - offset.y) < 1) {
            return this.__updateThrottle();
        }

        evt.preventDefault();
        evt.stopPropagation();

        this.__speedUp(delta.x / duration, delta.y / duration);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
