/**
 * @module
 * @prototype {Function} __setMovement
 */

import { pickInRange } from '../utils/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __setMovement(deltaX = 0, deltaY = 0) {
    const {
        options,
        movement
    } = this;

    this.__updateThrottle();

    let limit = this.__getDeltaLimit();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    movement.x = pickInRange(deltaX, ...limit.x);
    movement.y = pickInRange(deltaY, ...limit.y);
};

Object.defineProperty(SmoothScrollbar.prototype, '__setMovement', {
    value: __setMovement,
    writable: true,
    configurable: true
});