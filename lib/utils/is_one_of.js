"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module
 * @export {Function} isOneOf
 */

/**
 * Check if `a` is one of `[...b]`
 *
 * @return {Boolean}
 */
var isOneOf = exports.isOneOf = function isOneOf(a) {
  var b = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  return b.some(function (v) {
    return a === v;
  });
};