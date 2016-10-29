import {
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../utils/';

import {
    setPosition,
} from '../apis/';

import {
    renderOverscroll,
} from '../overscroll/';

import {
    getNextFrame,
} from './get-next-frame';

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
        const nextX = this::getNextFrame('x');
        const nextY = this::getNextFrame('y');
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
