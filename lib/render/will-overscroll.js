'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

// check if scrollbar scrolls onto very edge in particular direction
/**
 * @module
 * @prototype {Function} __willOverscroll
 */

function __willOverscroll() {
    var dir = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var delta = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    if (!dir) return false;

    var offset = this.offset;
    var limit = this.limit;


    var currentOffset = offset[dir];

    // cond:
    //  1. next scrolling position is supposed to stay unchange
    //  2. current position is on the edge
    return (0, _utils.pickInRange)(delta + currentOffset, 0, limit[dir]) === currentOffset && (currentOffset === 0 || currentOffset === limit[dir]);
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__willOverscroll', {
    value: __willOverscroll,
    writable: true,
    configurable: true
});