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

    let x = movement.x + deltaX * options.speed;
    let y = movement.y + deltaY * options.speed;

    if (options.continuousScrolling) {
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