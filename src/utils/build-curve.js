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
export const buildCurve = (distance, duration) => {
    const res = [];

    if (duration <= 0) return res;

    const n = Math.round(duration / 1000 * 60) - 1;
    const d = distance ? Math.pow(1 / Math.abs(distance), 1 / n) : 0;

    for (let i = 1; i <= n; i++) {
        res.push(distance - distance * Math.pow(d, i));
    }

    // last frame
    res.push(distance);

    return res;
};
