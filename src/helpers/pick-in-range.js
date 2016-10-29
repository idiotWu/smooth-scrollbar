/**
 * Pick value in range [min, max]
 * @param {number} value
 * @param {number} [min=-Infinity]
 * @param {number} [max=Infinity]
 *
 * @return {number}
 */
export function pickInRange(value, min = -Infinity, max = Infinity) {
    return Math.max(min, Math.min(value, max));
};
