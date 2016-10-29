'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getDeltaLimit = getDeltaLimit;

var _utils = require('../utils/');

/**
 * Get the limitation of scroll delta
 * @private
 * @param  {boolean} [allowOverscroll=false] - Whether allow overscroll or not
 * @return {object}  {x, y}
 */
function getDeltaLimit() {
    var allowOverscroll = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        offset = _ref.offset,
        limit = _ref.limit;

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
};