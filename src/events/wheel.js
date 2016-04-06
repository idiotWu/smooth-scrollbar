/**
 * @module
 * @prototype {Function} __wheelHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getDelta } from '../utils/index';

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
        if (this.__ignoreEvent(evt)) return;

        evt.preventDefault();
        evt.stopPropagation();

        const { offset, limit } = this;
        const delta = getDelta(evt);

        this.__addMovement(delta.x, delta.y);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
