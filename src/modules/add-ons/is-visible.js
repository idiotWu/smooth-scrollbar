import {
    getPrivateProp,
} from '../utils/';
/**
 * Check if an element is visible
 * @public
 * @param  {element} target - Target element
 * @return {boolean}
 */
export function isVisible(elem) {
    const {
        bounding: a,
    } = this::getPrivateProp();

    const b = elem.getBoundingClientRect();

    if (a.left >= b.right || a.right <= b.left ||
        a.top >= b.bottom || a.bottom <= b.top
    ) {
        return false;
    }

    return true;
};
