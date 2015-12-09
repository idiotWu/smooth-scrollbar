/**
 * @module
 * @export {Function} getDelta
 * @dependencies [ getOriginalEvent ]
 */

import { getOriginalEvent } from './get_original_event';

const DELTA_SCALE = {
    STANDARD: 40,
    OTHERS: -120
};

const DELTA_MODE = {
    // todo: accurate line/page mode value
    DOM_DELTA_PIXEL: 1,
    DOM_DELTA_LINE: 20,
    DOM_DELTA_PAGE: window.innerHeight
};

const DOM_DELTA_MAP = {
    0: 'DOM_DELTA_PIXEL',
    1: 'DOM_DELTA_LINE',
    2: 'DOM_DELTA_PAGE'
};

let getDeltaMode = (mode) => DELTA_MODE[ DOM_DELTA_MAP[mode] ] || DELTA_MODE.DOM_DELTA_PIXEL;

/**
 * Normalizing wheel delta
 *
 * @param {Object} evt: event object
 */
export let getDelta = (evt) => {
    // get original DOM event
    evt = getOriginalEvent(evt);

    if ('deltaX' in evt) {
        const mode = getDeltaMode(evt.deltaMode);

        return {
            x: evt.deltaX / DELTA_SCALE.STANDARD * mode,
            y: evt.deltaY / DELTA_SCALE.STANDARD * mode
        };
    }

    if ('wheelDeltaX' in evt) {
        return {
            x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
            y: evt.wheelDeltaY / DELTA_SCALE.OTHERS
        };
    }

    // ie with touchpad
    return {
        x: 0,
        y: evt.wheelDelta / DELTA_SCALE.OTHERS
    };
};
