import { PRIVATE_METHODS } from '../../contants/';

/**
 * Get private method(s)
 * @private
 * @param {string} [name] - Specify the method to be got, or the whole private methods
 * @return {any}
 */
export function getPrivateMethod(name) {
    const privateMethods = this[PRIVATE_METHODS];

    if (typeof name === 'undefined') {
        const res = {};

        Reflect.keys(privateMethods).forEach(key => {
            res[key] = this::privateMethods[key];
        });

        return res;
    }

    return this::privateMethods[name];
};
