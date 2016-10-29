import {
    getPrivateProp,
} from '../utils/';

/**
 * Check if an event is fired from a nested scrollbar
 * @private
 * @param  {object} evt - Event object
 * @return {boolean}
 */
export function isFromNested({ target } = {}) {
    const children = this::getPrivateProp('children');

    return children.some(el => el.contains(target));
};
