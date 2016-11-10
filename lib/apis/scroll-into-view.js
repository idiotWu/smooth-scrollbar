'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

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
_smoothScrollbar.SmoothScrollbar.prototype.scrollIntoView = function (elem) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$onlyScrollIfNeed = _ref.onlyScrollIfNeeded,
        onlyScrollIfNeeded = _ref$onlyScrollIfNeed === undefined ? false : _ref$onlyScrollIfNeed,
        _ref$offsetTop = _ref.offsetTop,
        offsetTop = _ref$offsetTop === undefined ? 0 : _ref$offsetTop,
        _ref$offsetLeft = _ref.offsetLeft,
        offsetLeft = _ref$offsetLeft === undefined ? 0 : _ref$offsetLeft;

    var targets = this.targets,
        bounding = this.bounding;


    if (!elem || !targets.container.contains(elem)) return;

    var targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && this.isVisible(elem)) return;

    this.__setMovement(targetBounding.left - bounding.left - offsetLeft, targetBounding.top - bounding.top - offsetTop);
}; /**
    * @module
    * @prototype {Function} scrollIntoView
    */