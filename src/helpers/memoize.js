/**
 * Memoize getters
 * @param {object} source - { getter() {} }
 * @return {object}
 */
export function memoize(source) {
    const res = {};
    const cache = {};

    Object.keys(source).forEach((prop) => {
        Object.defineProperty(res, prop, {
            get() {
                if (!cache.hasOwnProperty(prop)) {
                    const getter = source[prop];

                    cache[prop] = getter();
                }

                return cache[prop];
            },
        });
    });

    return res;
};
