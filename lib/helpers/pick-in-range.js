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
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -Infinity;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;

  return Math.max(min, Math.min(value, max));
};