"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module
 * @export {Function} buildCurve
 */

/**
 * Build easing curve based on distance and duration
 * m(n) = m(0) * d^n
 *
 * @param {Number} begin
 * @param {Number} duration
 *
 * @return {Array}: points
 */
var buildCurve = exports.buildCurve = function buildCurve(distance, duration) {
  var res = [];

  if (duration <= 0) return res;

  var n = Math.round(duration / 1000 * 60) - 1;
  var d = distance ? Math.pow(1 / Math.abs(distance), 1 / n) : 0;

  for (var i = 1; i <= n; i++) {
    res.push(distance - distance * Math.pow(d, i));
  }

  // last frame
  res.push(distance);

  return res;
};