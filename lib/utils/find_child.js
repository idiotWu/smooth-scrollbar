"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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

  if (!children) return null;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var elem = _step.value;

      if (elem.className.match(className)) return elem;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return null;
};