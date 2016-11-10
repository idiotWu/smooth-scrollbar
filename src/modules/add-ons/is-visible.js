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
        bounding,
    } = this::getPrivateProp();

    const targetBounding = elem.getBoundingClientRect();

    // check overlapping
    const top = Math.max(bounding.top, targetBounding.top);
    const left = Math.max(bounding.left, targetBounding.left);
    const right = Math.min(bounding.right, targetBounding.right);
    const bottom = Math.min(bounding.bottom, targetBounding.bottom);

    return top < bottom && left < right;
};
