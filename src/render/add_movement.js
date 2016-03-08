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

    let limit = this.__getDeltaLimit();

    movement.x = pickInRange(movement.x + deltaX * options.speed, ...limit.x);
    movement.y = pickInRange(movement.y + deltaY * options.speed, ...limit.y);
};

Object.defineProperty(SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});