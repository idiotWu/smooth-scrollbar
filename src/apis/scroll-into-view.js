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
 * @param  {Boolean} options.alignToTop          whether to align to the top or the bottom edge of container
 * @param  {Boolean} options.onlyScrollIfNeeded  whether to scroll container when target element is visible
 * @param  {Number}  options.offsetTop           scrolling stop offset to top
 * @param  {Number}  options.offsetLeft          scrolling stop offset to left
 * @param  {Number}  options.offsetBottom        scrolling stop offset to bottom
 */
SmoothScrollbar.prototype.scrollIntoView = function (
    elem,
    {
        alignToTop = true,
        onlyScrollIfNeeded = false,
        offsetTop = 0,
        offsetLeft = 0,
        offsetBottom = 0,
    } = {}
) {
    const { targets, bounding } = this;

    if (!elem || !targets.container.contains(elem)) return;

    const targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && this.isVisible(elem)) return;

    this.__setMovement(
        targetBounding.left - bounding.left - offsetLeft,
        alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom - offsetBottom,
    );
};
