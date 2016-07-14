/**
 * @module
 * @export {Function} getPointerData
 */

/**
 * Get pointer/touch data
 * @param {Object} evt: event object
 */
export const getPointerData = (evt) => {
    // if is touch event, return last item in touchList
    // else return original event
    return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
};
