/**
 * @module
 * @prototype {Function} scrollIntoView
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @api
 * Scroll target element into visible area of scrollbar.
 *
 * @param  {Element} target                      target element
 * @param  {Boolean} options.onlyScrollIfNeeded  whether scroll container when target element is visible
 * @param  {Number}  options.offsetTop           scrolling stop offset to top
 * @param  {Number}  options.offsetLeft          scrolling stop offset to left
 */
SmoothScrollbar.prototype.scrollIntoView = function (
    elem,
    {
        onlyScrollIfNeeded = false,
        offsetTop = 0,
        offsetLeft = 0,
    } = {}
) {
    const { targets, bounding } = this;

    if (!elem || !targets.container.contains(elem)) return;

    const targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && this.isVisible(elem)) return;

    this.__setMovement(
        targetBounding.left - bounding.left - offsetLeft,
        targetBounding.top - bounding.top - offsetTop,
    );
};
