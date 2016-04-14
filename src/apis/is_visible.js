/**
 * @module
 * @prototype {Function} isVisible
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Check if an element is visible
 *
 * @param  {Element} target                      target element
 * @return {Boolean}
 */
SmoothScrollbar.prototype.isVisible = function(elem) {
    const { bounding } = this;

    let targetBounding = elem.getBoundingClientRect();

    // check overlapping
    let top = Math.max(bounding.top, targetBounding.top);
    let left = Math.max(bounding.left, targetBounding.left);
    let right = Math.min(bounding.right, targetBounding.right);
    let bottom = Math.min(bounding.bottom, targetBounding.bottom);

    return top <= bottom && left <= right;
};