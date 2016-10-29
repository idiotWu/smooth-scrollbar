'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shouldPropagateMovement = shouldPropagateMovement;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

/**
 * Check whether to propagate movement to outer scrollbars
 * These situations are considered as `true`:
 *         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
 *         2. scrollbar reaches one side and not about to scroll on the other direction
 *
 * @param {number} [deltaX]
 * @param {number} [deltaY]
 * @return {boolean}
 */
function shouldPropagateMovement() {
    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        offset = _ref.offset,
        limit = _ref.limit;

    if (!options.continuousScrolling) return false;

    var destX = (0, _helpers.pickInRange)(deltaX + offset.x, 0, limit.x);
    var destY = (0, _helpers.pickInRange)(deltaY + offset.y, 0, limit.y);
    var res = true;

    // offset not about to change
    res &= destX === offset.x;
    res &= destY === offset.y;

    // current offset is on the edge
    res &= destX === limit.x || destX === 0 || destY === limit.y || destY === 0;

    return res;
};