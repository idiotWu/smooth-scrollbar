'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

// check whether to propagate movement to outer scrollbars
// this situations are considered as `true`:
//         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
//         2. scrollbar reaches one side and not about to scroll on the other direction
/**
 * @module
 * @prototype {Function} __shouldPropagateMovement
 */

function __shouldPropagateMovement() {
    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var options = this.options,
        offset = this.offset,
        limit = this.limit;


    if (!options.continuousScrolling) return false;

    var destX = (0, _utils.pickInRange)(deltaX + offset.x, 0, limit.x);
    var destY = (0, _utils.pickInRange)(deltaY + offset.y, 0, limit.y);
    var res = true;

    // offset not about to change
    res &= destX === offset.x;
    res &= destY === offset.y;

    // current offset is on the edge
    res &= destX === limit.x || destX === 0 || destY === limit.y || destY === 0;

    return res;
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__shouldPropagateMovement', {
    value: __shouldPropagateMovement,
    writable: true,
    configurable: true
});