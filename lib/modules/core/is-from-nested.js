'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isFromNested = isFromNested;

var _utils = require('../utils/');

/**
 * Check if an event is fired from a nested scrollbar
 * @private
 * @param  {object} evt - Event object
 * @return {boolean}
 */
function isFromNested() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        target = _ref.target;

    var children = _utils.getPrivateProp.call(this, 'children');

    return children.some(function (el) {
        return el.contains(target);
    });
};