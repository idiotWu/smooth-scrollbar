import { PRIVATE_PROPS } from '../../contants/';

/**
 * Get private prop(s)
 * @private
 * @param {string} [prop] - Specify the property to be got, or the whole private props
 * @return {any}
 */
export function getPrivateProp(prop) {
    const privateProps = this[PRIVATE_PROPS];

    if (typeof prop === 'undefined') {
        return privateProps;
    }

    return privateProps[prop];
};
