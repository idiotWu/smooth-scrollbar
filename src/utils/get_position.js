/**
 * @module
 * @export {Function} getPosition
 * @dependencies [ getOriginalEvent, getPointerData ]
 */

import { getOriginalEvent } from './get_original_event';
import { getPointerData } from './get_pointer_data';

/**
 * Get pointer/finger position
 * @param {Object} evt: event object
 *
 * @return {Object}: position{x, y}
 */
export let getPosition = (evt) => {
    evt = getOriginalEvent(evt);

    let data = getPointerData(evt);

    return {
        x: data.clientX,
        y: data.clientY
    };
};
