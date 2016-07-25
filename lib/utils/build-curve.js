"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @module
 * @export {Function} buildCurve
 */

/**
 * Build quadratic easing curve
 *
 * @param {Number} begin
 * @param {Number} duration
 *
 * @return {Array}: points
 */
var buildCurve = exports.buildCurve = function buildCurve(distance, duration) {
  var res = [];

  if (duration <= 0) return res;

  var t = Math.round(duration / 1000 * 60);
  var a = -distance / Math.pow(t, 2);
  var b = -2 * a * t;

  for (var i = 0; i < t; i++) {
    res.push(a * Math.pow(i, 2) + b * i);
  }

  return res;
};