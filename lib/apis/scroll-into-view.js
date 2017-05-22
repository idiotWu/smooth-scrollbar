'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

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
_smoothScrollbar.SmoothScrollbar.prototype.scrollIntoView = function (elem) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$alignToTop = _ref.alignToTop,
        alignToTop = _ref$alignToTop === undefined ? true : _ref$alignToTop,
        _ref$onlyScrollIfNeed = _ref.onlyScrollIfNeeded,
        onlyScrollIfNeeded = _ref$onlyScrollIfNeed === undefined ? false : _ref$onlyScrollIfNeed,
        _ref$offsetTop = _ref.offsetTop,
        offsetTop = _ref$offsetTop === undefined ? 0 : _ref$offsetTop,
        _ref$offsetLeft = _ref.offsetLeft,
        offsetLeft = _ref$offsetLeft === undefined ? 0 : _ref$offsetLeft,
        _ref$offsetBottom = _ref.offsetBottom,
        offsetBottom = _ref$offsetBottom === undefined ? 0 : _ref$offsetBottom;

    var targets = this.targets,
        bounding = this.bounding;


    if (!elem || !targets.container.contains(elem)) return;

    var targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && this.isVisible(elem)) return;

    this.__setMovement(targetBounding.left - bounding.left - offsetLeft, alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom - offsetBottom);
}; /**
    * @module
    * @prototype {Function} scrollIntoView
    */