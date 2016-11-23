import {
    pickInRange,
} from '../../helpers/';

import {
    getDeltaLimit,
} from './get-delta-limit';

import {
    getPrivateProp,
} from '../namespace/';

import {
    updateDebounced,
} from '../debounced/';

/**
 * Add scroll movement
 * @private
 * @param {number}  [deltaX]
 * @param {number}  [deltaY]
 * @param {boolean} [allowOverscroll] - Whether allow overscroll or not
 */
export function addMovement(deltaX = 0, deltaY = 0, allowOverscroll = false) {
    const {
        limit,
        options,
        movement,
    } = this::getPrivateProp();

    this::updateDebounced();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    const x = limit.x === 0 ? 0 : movement.x + deltaX;
    const y = limit.y === 0 ? 0 : movement.y + deltaY;

    const deltaLimit = this::getDeltaLimit(allowOverscroll);

    movement.x = pickInRange(x, ...deltaLimit.x);
    movement.y = pickInRange(y, ...deltaLimit.y);
};
