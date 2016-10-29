"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOneOf = isOneOf;
/**
 * Check if `a` is one of `[...b]`
 * @param {any} a - Value to be compared
 * @param {array} [b=[]] - Target array
 * @return {Boolean}
 */
function isOneOf(a) {
  var b = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  return b.some(function (v) {
    return a === v;
  });
};