/**
 * @module
 * @export {Function} getTouchID
 * @dependencies [ getOriginalEvent, getPointerData ]
 */

import { getOriginalEvent } from './get_original_event';
import { getPointerData } from './get_pointer_data';

/**
 * Get touch identifier
 *
 * @param {Object} evt: event object
 *
 * @return {Number}: touch id
 */
export let getTouchID = (evt) => {
    evt = getOriginalEvent(evt);

    let data = getPointerData(evt);

    return data.identifier;
};