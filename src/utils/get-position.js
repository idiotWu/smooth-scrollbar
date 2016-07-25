/**
 * @module
 * @export {Function} getPosition
 */

import { getPointerData } from './get-pointer-data';

/**
 * Get pointer/finger position
 * @param {Object} evt: event object
 *
 * @return {Object}: position{x, y}
 */
export const getPosition = (evt) => {
    const data = getPointerData(evt);

    return {
        x: data.clientX,
        y: data.clientY,
    };
};
