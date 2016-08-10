"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findChild = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @export {Function} findChild
 */

/**
 * Find element with specific class name within children, like selector '>'
 *
 * @param {Element} parentElem
 * @param {String} className
 *
 * @return {Element}: first matched child
 */
var findChild = exports.findChild = function findChild(parentElem, className) {
    var children = parentElem.children;

    var res = null;

    if (children) {
        [].concat((0, _toConsumableArray3.default)(children)).some(function (elem) {
            if (elem.className.match(className)) {
                res = elem;
                return true;
            }
        });
    }

    return res;
};