/**
 * @module
 * @export {Function} getPointerData
 * @dependencies [ getOriginalEvent ]
 */

import { getOriginalEvent } from './get_original_event';

/**
 * Get pointer/touch data
 * @param {Object} evt: event object
 */
export let getPointerData = (evt) => {
    // if is touch event, return last item in touchList
    // else return original event
    evt = getOriginalEvent(evt);

    return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
};
