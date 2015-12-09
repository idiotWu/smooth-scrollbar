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
export let pickInRange = (value, min = 0, max = 0) => Math.max(min, Math.min(value, max));
