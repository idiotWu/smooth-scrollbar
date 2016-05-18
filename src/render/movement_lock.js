/**
 * @module
 * @prototype {Function} __autoLockMovement
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

const DIRECTIONS = ['x', 'y'];

function __autoLockMovement() {
    const {
        movement,
        movementLocked
    } = this;

    DIRECTIONS.forEach((dir) => {
        movementLocked[dir] = movement[dir] && this.__isOntoEdge(dir, movement[dir]);
    });
};

function __unlockMovement() {
    const { movementLocked } = this;

    DIRECTIONS.forEach((dir) => movementLocked[dir] = false);
};

function __isMovementLocked() {
    const { movementLocked } = this;

    return movementLocked.x || movementLocked.y;
}

Object.defineProperty(SmoothScrollbar.prototype, '__autoLockMovement', {
    value: __autoLockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(SmoothScrollbar.prototype, '__unlockMovement', {
    value: __unlockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(SmoothScrollbar.prototype, '__isMovementLocked', {
    value: __isMovementLocked,
    writable: true,
    configurable: true
});