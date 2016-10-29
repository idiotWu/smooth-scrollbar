import {
    getPointerPosition,
} from '../../helpers';

import {
    getPrivateProp,
} from '../utils/';

/**
 * Get pointer's offset to most relative boundaries
 * @private
 * @param  {object} evt - Event object
 * @param  {number} [shrink=0] - Shrinking the container box
 * @return {object} {x, y}
 */
export function getPointerOffset(evt, shrink = 0) {
    const {
        top,
        right,
        bottom,
        left,
    } = this::getPrivateProp('bounding');

    const { x, y } = getPointerPosition(evt);

    const res = {
        x: 0,
        y: 0,
    };

    if (x === 0 && y === 0) return res;

    if (x > right - shrink) {
        res.x = (x - right + shrink);
    } else if (x < left + shrink) {
        res.x = (x - left - shrink);
    }

    if (y > bottom - shrink) {
        res.y = (y - bottom + shrink);
    } else if (y < top + shrink) {
        res.y = (y - top - shrink);
    }

    return res;
};

