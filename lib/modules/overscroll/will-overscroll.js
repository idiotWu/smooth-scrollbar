'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.willOverscroll = willOverscroll;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

/**
 * Check if scrollbar scrolls onto very edge in particular direction
 * @private
 * @param {string} dir - Direction to be check
 * @param {number} delta - Next delta value
 * @return {boolean}
 */
/**
 * @module
 * @prototype {Function} __willOverscroll
 */

function willOverscroll() {
    var dir = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var delta = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    if (!dir) return false;

    var _ref = _utils.getPrivateProp.call(this);

    var offset = _ref.offset;
    var limit = _ref.limit;


    var currentOffset = offset[dir];

    // cond:
    //  1. next scrolling position is supposed to stay unchange
    //  2. current position is on the edge
    return (0, _helpers.pickInRange)(delta + currentOffset, 0, limit[dir]) === currentOffset && (currentOffset === 0 || currentOffset === limit[dir]);
};