import {
    getPrivateProp,
} from '../namespace/';

import { willOverscroll } from './will-overscroll';

const DIRECTIONS = ['x', 'y'];

/**
 * Automatically lock movement on the directions which are about to overscrolling
 * @private
 */
export function autoLockMovement() {
    const {
        movement,
        movementLocked,
    } = this::getPrivateProp();

    DIRECTIONS.forEach((dir) => {
        movementLocked[dir] = movement[dir] && this::willOverscroll(dir, movement[dir]);
    });
};

/**
 * Unlock movements on all directions
 * @private
 */
export function unlockMovement() {
    const {
        movementLocked,
    } = this::getPrivateProp();

    DIRECTIONS.forEach((dir) => {
        movementLocked[dir] = false;
    });
};

/**
 * Detect whether the movement is locked(on any side)
 * @private
 */
export function isMovementLocked() {
    const {
        movementLocked,
    } = this::getPrivateProp();

    return movementLocked.x || movementLocked.y;
};
