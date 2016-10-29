"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildCurve = buildCurve;
/**
 * Build quadratic easing curve
 * @param {number} distance
 * @param {number} duration
 * @return {array}
 */
function buildCurve(distance, duration) {
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