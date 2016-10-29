"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickInRange = pickInRange;
/**
 * Pick value in range [min, max]
 * @param {number} value
 * @param {number} [min=-Infinity]
 * @param {number} [max=Infinity]
 *
 * @return {number}
 */
function pickInRange(value) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? -Infinity : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];

  return Math.max(min, Math.min(value, max));
};