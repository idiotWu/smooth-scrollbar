/**
 * @module
 * @prototype {Function} __addMovement
 */

import { pickInRange } from '../utils/';
import { SmoothScrollbar } from '../smooth-scrollbar';

function __addMovement(deltaX = 0, deltaY = 0) {
    const {
        limit,
        options,
        movement,
    } = this;

    this.__updateThrottle();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    let x = movement.x + deltaX;
    let y = movement.y + deltaY;

    if (limit.x === 0) x = 0;
    if (limit.y === 0) y = 0;

    let deltaLimit = this.__getDeltaLimit();

    movement.x = pickInRange(x, ...deltaLimit.x);
    movement.y = pickInRange(y, ...deltaLimit.y);
};

Object.defineProperty(SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true,
});
