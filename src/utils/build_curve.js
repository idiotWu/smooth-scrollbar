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
export const buildCurve = (distance, duration) => {
    const res = [];

    if (duration <= 0) return res;

    const t = Math.round(duration / 1000 * 60);
    const a = -distance / t ** 2;
    const b = -2 * a * t;

    for (let i = 0; i < t; i++) {
        res.push(a * i ** 2 + b * i);
    }

    return res;
};
