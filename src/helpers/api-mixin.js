/**
 * API mixin decorator
 * @decorator
 * @param {object} source
 */
export function apiMixin(source) {
    return (Constructor) => {
        Object.keys(source).forEach((key) => {
            Object.defineProperty(Constructor.prototype, key, {
                value: source[key],
                enumerable: false,
                writable: true,
                configurable: true,
            });
        });
    };
}
