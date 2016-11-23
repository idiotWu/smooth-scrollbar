import { PRIVATE_PROPS } from '../../contants/';

/**
 * Define/Update private prop(s) on instance
 * @private
 * @param {string|object} prop - Property name, or an object descripts { prop: value }
 * @param {any} value
 * @return {this}
 */
export function setPrivateProp(prop, value) {
    const privateProps = this[PRIVATE_PROPS];

    if (typeof prop === 'object') {
        const src = prop;
        Object.keys(src).forEach(key => {
            Object.defineProperty(
                privateProps,
                key,
                Object.getOwnPropertyDescriptor(src, key),
            );
        });
    } else {
        privateProps[prop] = value;
    }

    return this;
};
