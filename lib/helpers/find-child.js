"use strict";

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.findChild = findChild;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

/**
 * Find element with specific class name within children, like selector '>'
 * @param {element} parentElem
 * @param {string} className
 * @return {element|null} - first matched child
 */
function findChild(parentElem, className) {
    var children = parentElem.children;

    var res = null;

    if (children) {
        [].concat(_toConsumableArray(children)).some(function (elem) {
            if (elem.className.match(className)) {
                res = elem;
                return true;
            }
        });
    }

    return res;
};