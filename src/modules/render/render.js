import {
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../utils/';

import {
    willOverscroll,
    renderOverscroll,
} from '../overscroll/';

import { setPosition } from './set-position';

/**
 * Main render loop
 * @private
 */
export function render() {
    const {
        options,
        offset,
        limit,
        movement,
        movementLocked,
        overscrollRendered,
        timerID,
    } = this::getPrivateProp();

    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        const nextX = this::calcNextFrame('x');
        const nextY = this::calcNextFrame('y');
        const overflowDir = [];

        if (options.overscrollEffect) {
            const destX = pickInRange(nextX.position, 0, limit.x);
            const destY = pickInRange(nextY.position, 0, limit.y);

            // overscroll is rendering
            // or scrolling onto particular edge
            if (overscrollRendered.x ||
                (destX === offset.x && movement.x)) {
                overflowDir.push('x');
            }

            if (overscrollRendered.y ||
                (destY === offset.y && movement.y)) {
                overflowDir.push('y');
            }
        }

        if (!movementLocked.x) movement.x = nextX.movement;
        if (!movementLocked.y) movement.y = nextY.movement;

        this::setPosition(nextX.position, nextY.position);
        this::renderOverscroll(overflowDir);
    }

    timerID.render = requestAnimationFrame(this::render);
};

/**
 * Get movement details of next frame
 * @param  {string} dir - Scroll direction
 * @return {object} - { movement, position }
 */
function calcNextFrame(dir) {
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
