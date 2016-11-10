'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var DIRECTIONS = ['x', 'y'];

// only lock movement on direction that is scrolling onto edge
/**
 * @module
 * @prototype {Function} __autoLockMovement
 */

function __autoLockMovement() {
    var _this = this;

    var movement = this.movement,
        movementLocked = this.movementLocked;


    DIRECTIONS.forEach(function (dir) {
        movementLocked[dir] = movement[dir] && _this.__willOverscroll(dir, movement[dir]);
    });
};

function __unlockMovement() {
    var movementLocked = this.movementLocked;


    DIRECTIONS.forEach(function (dir) {
        movementLocked[dir] = false;
    });
};

function __isMovementLocked() {
    var movementLocked = this.movementLocked;


    return movementLocked.x || movementLocked.y;
}

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__autoLockMovement', {
    value: __autoLockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__unlockMovement', {
    value: __unlockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__isMovementLocked', {
    value: __isMovementLocked,
    writable: true,
    configurable: true
});