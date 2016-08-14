/**
 * @module
 * @prototype {Function} isVisible
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @api
 * Check if an element is visible
 *
 * @param  {Element} target  target element
 * @return {Boolean}
 */
SmoothScrollbar.prototype.isVisible = function (elem) {
    const { bounding } = this;

    const targetBounding = elem.getBoundingClientRect();

    // check overlapping
    const top = Math.max(bounding.top, targetBounding.top);
    const left = Math.max(bounding.left, targetBounding.left);
    const right = Math.min(bounding.right, targetBounding.right);
    const bottom = Math.min(bounding.bottom, targetBounding.bottom);

    return top < bottom && left < right;
};
