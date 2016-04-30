/**
 * @module
 * @prototype {Function} __wheelHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getDelta } from '../utils/';

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
        const { options } = this;
        const { x, y } = getDelta(evt);

        if (options.continuousScrolling && this.__scrollOntoEdge(x, y)) {
            return this.__updateThrottle();
        }

        evt.preventDefault();

        this.__addMovement(x * options.speed, y * options.speed);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
