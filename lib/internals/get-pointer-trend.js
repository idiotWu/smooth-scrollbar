'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

/**
 * @module
 * @prototype {Function} __getPointerTrend
 */

function __getPointerTrend(evt) {
    var padding = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var _bounding = this.bounding;
    var top = _bounding.top;
    var right = _bounding.right;
    var bottom = _bounding.bottom;
    var left = _bounding.left;

    var _getPosition = (0, _utils.getPosition)(evt);

    var x = _getPosition.x;
    var y = _getPosition.y;


    var res = {
        x: 0,
        y: 0
    };

    if (x === 0 && y === 0) return res;

    if (x > right - padding) {
        res.x = x - right + padding;
    } else if (x < left + padding) {
        res.x = x - left - padding;
    }

    if (y > bottom - padding) {
        res.y = y - bottom + padding;
    } else if (y < top + padding) {
        res.y = y - top - padding;
    }

    return res;
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__getPointerTrend', {
    value: __getPointerTrend,
    writable: true,
    configurable: true
});