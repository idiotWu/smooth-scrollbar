/**
 * @module
 * @export {Function} getTouchID
 */

import { getPointerData } from './get_pointer_data';

/**
 * Get touch identifier
 *
 * @param {Object} evt: event object
 *
 * @return {Number}: touch id
 */
export const getTouchID = (evt) => {
    const data = getPointerData(evt);

    return data.identifier;
};
