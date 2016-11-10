'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

function __getDeltaLimit() {
    var allowOverscroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var options = this.options,
        offset = this.offset,
        limit = this.limit;


    if (allowOverscroll && (options.continuousScrolling || options.overscrollEffect)) {
        return {
            x: [-Infinity, Infinity],
            y: [-Infinity, Infinity]
        };
    }

    return {
        x: [-offset.x, limit.x - offset.x],
        y: [-offset.y, limit.y - offset.y]
    };
} /**
   * @module
   * @prototype {Function} __getDeltaLimit
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__getDeltaLimit', {
    value: __getDeltaLimit,
    writable: true,
    configurable: true
});