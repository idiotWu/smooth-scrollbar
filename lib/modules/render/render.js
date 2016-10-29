'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.render = render;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _apis = require('../apis/');

var _overscroll = require('../overscroll/');

var _getNextFrame = require('./get-next-frame');

/**
 * Main render loop
 * @private
 */
function render() {
    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        offset = _ref.offset,
        limit = _ref.limit,
        movement = _ref.movement,
        movementLocked = _ref.movementLocked,
        overscrollRendered = _ref.overscrollRendered,
        timerID = _ref.timerID;

    if (movement.x || movement.y || overscrollRendered.x || overscrollRendered.y) {
        var nextX = _getNextFrame.getNextFrame.call(this, 'x');
        var nextY = _getNextFrame.getNextFrame.call(this, 'y');
        var overflowDir = [];

        if (options.overscrollEffect) {
            var destX = (0, _helpers.pickInRange)(nextX.position, 0, limit.x);
            var destY = (0, _helpers.pickInRange)(nextY.position, 0, limit.y);

            // overscroll is rendering
            // or scrolling onto particular edge
            if (overscrollRendered.x || destX === offset.x && movement.x) {
                overflowDir.push('x');
            }

            if (overscrollRendered.y || destY === offset.y && movement.y) {
                overflowDir.push('y');
            }
        }

        if (!movementLocked.x) movement.x = nextX.movement;
        if (!movementLocked.y) movement.y = nextY.movement;

        _apis.setPosition.call(this, nextX.position, nextY.position);
        _overscroll.renderOverscroll.call(this, overflowDir);
    }

    timerID.render = requestAnimationFrame(render.bind(this));
};