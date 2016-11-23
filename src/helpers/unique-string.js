/**
 * Get unique string
 * @param  {string} str - source string
 * @return {string|symbol}
 */
export function uniqueString(str) {
    return typeof Symbol === 'function' ?
        Symbol(str) :
        `${str}$$${Date.now().toString(32)}`;
}
