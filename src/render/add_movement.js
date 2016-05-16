/**
 * @module
 * @prototype {Function} __addMovement
 */

import { pickInRange } from '../utils/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __addMovement(deltaX = 0, deltaY = 0) {
    const {
        options,
        movement
    } = this;

    this.__updateThrottle();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    let x = movement.x + deltaX;
    let y = movement.y + deltaY;

    if (this.limit.x === 0) x = 0;
    if (this.limit.y === 0) y = 0;

    if (options.continuousScrolling || options.overscrollEffect) {
        // no limitaion for continuous/overscroll enabled
        movement.x = x;
        movement.y = y;
    } else {
        let limit = this.__getDeltaLimit();

        movement.x = pickInRange(x, ...limit.x);
        movement.y = pickInRange(y, ...limit.y);
    }
};

Object.defineProperty(SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});