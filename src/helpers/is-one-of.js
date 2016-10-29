/**
 * Check if `a` is one of `[...b]`
 * @param {any} a - Value to be compared
 * @param {array} [b=[]] - Target array
 * @return {Boolean}
 */
export function isOneOf(a, b = []) {
    return b.some(v => a === v);
};
