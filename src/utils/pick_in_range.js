/**
 * @module
 * @export {Function} pickInRange
 */

/**
 * Pick value in range [min, max]
 * @param {Number} value
 * @param {Number} [min]
 * @param {Number} [max]
 *
 * @return {Number}
 */
export const pickInRange = (value, min = -Infinity, max = Infinity) => Math.max(min, Math.min(value, max));
