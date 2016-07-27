/**
 * @module
 * @prototype {Function} __wheelHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { getDelta, debounce } from '../utils/';
import { GLOBAL_ENV } from '../shared/';

/**
 * @method
 * @internal
 * Wheel event handler builder
 */
function __wheelHandler() {
    const { container } = this.targets;

    let wheelLocked = false;

    // since we can't detect whether user release touchpad
    // handle it with debounce is the best solution now, as a trade-off
    const releaseWheel = debounce(() => {
        wheelLocked = false;
    }, 30, false);

    this.__addEvent(container, GLOBAL_ENV.WHEEL_EVENT, (evt) => {
        const { options } = this;
        let { x, y } = getDelta(evt);

        x *= options.speed;
        y *= options.speed;

        if (this.__shouldPropagateMovement(x, y)) {
            return this.__updateThrottle();
        }

        evt.preventDefault();
        releaseWheel();

        if (this.overscrollBack) {
            wheelLocked = true;
        }

        if (wheelLocked) {
            if (this.__willOverscroll('x', x)) x = 0;
            if (this.__willOverscroll('y', y)) y = 0;
        }

        this.__addMovement(x, y);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true,
});
