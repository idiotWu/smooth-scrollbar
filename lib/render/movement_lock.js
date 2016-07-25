'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

var DIRECTIONS = ['x', 'y'];

// only lock movement on direction that is scrolling onto edge
/**
 * @module
 * @prototype {Function} __autoLockMovement
 */

function __autoLockMovement() {
    var _this = this;

    var movement = this.movement;
    var movementLocked = this.movementLocked;


    DIRECTIONS.forEach(function (dir) {
        movementLocked[dir] = movement[dir] && _this.__isOntoEdge(dir, movement[dir]);
    });
};

function __unlockMovement() {
    var movementLocked = this.movementLocked;


    DIRECTIONS.forEach(function (dir) {
        return movementLocked[dir] = false;
    });
};

function __isMovementLocked() {
    var movementLocked = this.movementLocked;


    return movementLocked.x || movementLocked.y;
}

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__autoLockMovement', {
    value: __autoLockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__unlockMovement', {
    value: __unlockMovement,
    writable: true,
    configurable: true
});

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__isMovementLocked', {
    value: __isMovementLocked,
    writable: true,
    configurable: true
});