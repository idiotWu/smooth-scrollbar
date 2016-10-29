'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNextFrame = getNextFrame;

var _utils = require('../utils/');

var _overscroll = require('../overscroll/');

/**
 * Get movement details of next frame
 * @private
 * @param  {string} dir - Scroll direction
 * @return {object} - { movement, position }
 */
function getNextFrame(dir) {
    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        offset = _ref.offset,
        movement = _ref.movement,
        touchRecord = _ref.touchRecord;

    var damping = options.damping,
        renderByPixels = options.renderByPixels,
        overscrollDamping = options.overscrollDamping;


    var current = offset[dir];
    var remain = movement[dir];

    var renderDamping = damping;

    if (_overscroll.willOverscroll.call(this, dir, remain)) {
        renderDamping = overscrollDamping;
    } else if (touchRecord.isActive()) {
        renderDamping = 0.5;
    }

    if (Math.abs(remain) < 1) {
        var next = current + remain;

        return {
            movement: 0,
            position: remain > 0 ? Math.ceil(next) : Math.floor(next)
        };
    }

    var nextMovement = remain * (1 - renderDamping);

    if (renderByPixels) {
        nextMovement |= 0;
    }

    return {
        movement: nextMovement,
        position: current + remain - nextMovement
    };
};