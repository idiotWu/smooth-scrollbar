'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.autoLockMovement = autoLockMovement;
exports.unlockMovement = unlockMovement;
exports.isMovementLocked = isMovementLocked;

var _utils = require('../utils/');

var _overscroll = require('../overscroll/');

var DIRECTIONS = ['x', 'y'];

/**
 * Automatically lock movement on the directions which are about to overscrolling
 * @private
 */
function autoLockMovement() {
    var _this = this;

    var _ref = _utils.getPrivateProp.call(this),
        movement = _ref.movement,
        movementLocked = _ref.movementLocked;

    DIRECTIONS.forEach(function (dir) {
        movementLocked[dir] = movement[dir] && _overscroll.willOverscroll.call(_this, dir, movement[dir]);
    });
};

/**
 * Unlock movements on all directions
 * @private
 */
function unlockMovement() {
    var _ref2 = _utils.getPrivateProp.call(this),
        movementLocked = _ref2.movementLocked;

    DIRECTIONS.forEach(function (dir) {
        movementLocked[dir] = false;
    });
};

/**
 * Detect whether the movement is locked(on any side)
 * @private
 */
function isMovementLocked() {
    var _ref3 = _utils.getPrivateProp.call(this),
        movementLocked = _ref3.movementLocked;

    return movementLocked.x || movementLocked.y;
};