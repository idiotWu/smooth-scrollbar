import { PRIVATE_METHODS } from '../../contants/';

/**
 * Define private method(s)
 * @private
 * @param {string|object} name - Method name, or an object descripts { name: fn }
 * @param {function} [fn] - Method body
 * @return {this}
 */
export function definePrivateMethod(name, fn) {
    const privateMethods = this[PRIVATE_METHODS];

    if (typeof name === 'object') {
        const src = name;
        Reflect.ownKeys(src).forEach(key => {
            Reflect.defineProperty(
                privateMethods,
                key,
                Reflect.getOwnPropertyDescriptor(src, key),
            );
        });
    } else {
        privateMethods[name] = fn;
    }

    return this;
};
