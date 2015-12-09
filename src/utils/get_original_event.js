/**
 * @module
 * @export {Function} getOriginalEvent
 */

/**
 * Get original DOM event
 *
 * @param {Object} evt: event object
 *
 * @return {EventObject}
 */
export let getOriginalEvent = (evt) => {
    return evt.originalEvent || evt;
};