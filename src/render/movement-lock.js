/**
 * @module
 * @prototype {Function} __autoLockMovement
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

const DIRECTIONS = ['x', 'y'];

// only lock movement on direction that is scrolling onto edge
function __autoLockMovement() {
    const {
        movement,
        movementLocked,
    } = this;

    DIRECTIONS.forEach((dir) => {
        movementLocked[dir] = movement[dir] && this.__willOverscroll(dir, movement[dir]);
    });
};

function __unlockMovement() {
    const { movementLocked } = this;

    DIRECTIONS.forEach((dir) => {
        movementLocked[dir] = false;
    });
};

function __isMovementLocked() {
    const { movementLocked } = this;

    return movementLocked.x || movementLocked.y;
}

Object.defineProperty(SmoothScrollbar.prototype, '__autoLockMovement', {
    value: __autoLockMovement,
    writable: true,
    configurable: true,
});

Object.defineProperty(SmoothScrollbar.prototype, '__unlockMovement', {
    value: __unlockMovement,
    writable: true,
    configurable: true,
});

Object.defineProperty(SmoothScrollbar.prototype, '__isMovementLocked', {
    value: __isMovementLocked,
    writable: true,
    configurable: true,
});
