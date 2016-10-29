import {
    getPrivateProp,
} from '../utils/';

import {
    willOverscroll,
} from '../overscroll/';

/**
 * Get movement details of next frame
 * @private
 * @param  {string} dir - Scroll direction
 * @return {object} - { movement, position }
 */
export function getNextFrame(dir) {
    const {
        options,
        offset,
        movement,
        touchRecord,
    } = this::getPrivateProp();

    const {
        damping,
        renderByPixels,
        overscrollDamping,
    } = options;

    const current = offset[dir];
    const remain = movement[dir];

    let renderDamping = damping;

    if (this::willOverscroll(dir, remain)) {
        renderDamping = overscrollDamping;
    } else if (touchRecord.isActive()) {
        renderDamping = 0.5;
    }

    if (Math.abs(remain) < 1) {
        let next = current + remain;

        return {
            movement: 0,
            position: remain > 0 ? Math.ceil(next) : Math.floor(next),
        };
    }

    let nextMovement = remain * (1 - renderDamping);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + remain - nextMovement,
    };
};
