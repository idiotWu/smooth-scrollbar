'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clearMovement = undefined;
exports.stop = stop;

var _utils = require('../utils/');

/**
 * Stop scrolling
 * @public
 */
function stop() {
    var _ref = _utils.getPrivateProp.call(this),
        movement = _ref.movement,
        timerID = _ref.timerID;

    movement.x = movement.y = 0;
    cancelAnimationFrame(timerID.scrollTo);
};

var clearMovement = exports.clearMovement = stop;