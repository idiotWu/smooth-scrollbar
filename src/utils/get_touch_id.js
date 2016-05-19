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
export let getTouchID = (evt) => {
    let data = getPointerData(evt);

    return data.identifier;
};