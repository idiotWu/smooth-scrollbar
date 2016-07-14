/**
 * @module
 * @export {Function} isOneOf
 */

/**
 * Check if `a` is one of `[...b]`
 *
 * @return {Boolean}
 */
export const isOneOf = (a, b = []) => {
    return b.some(v => a === v);
};
