/**
 * @module
 * @prototype {Function} __wheelHandler
 * @dependencies [ SmoothScrollbar, #scrollTo, getDelta, pickInRange ]
 */

import '../apis/scroll_to';
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
let __wheelHandler = function({ speed, stepLength }) {
    let { container } = this.targets;

    this.$on(WHEEL_EVENT, container, (evt) => {
        let { offset, limit } = this;
        let { x, y } = getDelta(evt);

        let destX = pickInRange(x * speed * stepLength + offset.x, 0, limit.x);
        let destY = pickInRange(y * speed * stepLength + offset.y, 0, limit.y);

        if (Math.abs(destX - offset.x) < 1 && Math.abs(destY - offset.y) < 1) {
            return this.__updateThrottle();
        }

        evt.preventDefault();
        evt.stopPropagation();

        let duration = 120 * Math.sqrt(Math.max(Math.abs(x), Math.abs(y)));

        this.scrollTo(destX, destY, duration / speed);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});
