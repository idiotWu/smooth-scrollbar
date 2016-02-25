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

        let destX = pickInRange(delta.x + offset.x, 0, limit.x);
        let destY = pickInRange(delta.y + offset.y, 0, limit.y);

        if (destX === offset.x && destY === offset.y) {
            return this.__updateThrottle();
        }

        evt.preventDefault();
        evt.stopPropagation();

        this.__addMovement(delta.x, delta.y);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
