import {
    pickInRange,
} from '../../helpers';

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
 * Set scroll movement
 * @private
 * @param {number}  [deltaX]
 * @param {number}  [deltaY]
 * @param {boolean} [allowOverscroll] - Whether allow overscroll or not
 */
export function setMovement(deltaX = 0, deltaY = 0, allowOverscroll = false) {
    const {
        options,
        movement,
    } = this::getPrivateProp();

    this::updateDebounced();

    const limit = this::getDeltaLimit(allowOverscroll);

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    movement.x = pickInRange(deltaX, ...limit.x);
    movement.y = pickInRange(deltaY, ...limit.y);
};
