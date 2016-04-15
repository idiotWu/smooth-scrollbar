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

    this.__addEvent(container, WHEEL_EVENT, (evt) => {
        if (this.__ignoreEvent(evt, true)) return;

        const { offset, limit, options } = this;
        const delta = getDelta(evt);

        if (options.continuousScrolling && this.__scrollOntoEdge(delta.x, delta.y)) {
            return this.__updateThrottle();
        }

        evt.preventDefault();
        // evt.stopPropagation();

        this.__addMovement(delta.x, delta.y);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
