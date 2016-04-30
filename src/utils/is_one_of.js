/**
 * @module
 * @export {Function} isOneOf
 */

/**
 * Check if `a` is one of `[...b]`
 *
 * @return {Boolean}
 */
export let isOneOf = (a, b = []) => {
    return b.some(v => a === v);
};