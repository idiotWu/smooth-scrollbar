'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPointerOffset = getPointerOffset;

var _helpers = require('../../helpers');

var _utils = require('../utils/');

/**
 * Get pointer's offset to most relative boundaries
 * @private
 * @param  {object} evt - Event object
 * @param  {number} [shrink=0] - Shrinking the container box
 * @return {object} {x, y}
 */
function getPointerOffset(evt) {
    var shrink = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var _ref = _utils.getPrivateProp.call(this, 'bounding'),
        top = _ref.top,
        right = _ref.right,
        bottom = _ref.bottom,
        left = _ref.left;

    var _getPointerPosition = (0, _helpers.getPointerPosition)(evt),
        x = _getPointerPosition.x,
        y = _getPointerPosition.y;

    var res = {
        x: 0,
        y: 0
    };

    if (x === 0 && y === 0) return res;

    if (x > right - shrink) {
        res.x = x - right + shrink;
    } else if (x < left + shrink) {
        res.x = x - left - shrink;
    }

    if (y > bottom - shrink) {
        res.y = y - bottom + shrink;
    } else if (y < top + shrink) {
        res.y = y - top - shrink;
    }

    return res;
};