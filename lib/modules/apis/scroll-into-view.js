'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.scrollIntoView = scrollIntoView;

var _utils = require('../utils/');

var _render = require('../render/');

var _isVisible = require('./is-visible');

/**
 * Scroll target element into visible area of scrollbar.
 * @public
 * @param {element} target - target element
 * @param {boolean} options.onlyScrollIfNeeded - whether scroll container when target element is visible
 * @param {number} options.offsetTop - scrolling stop offset to top
 * @param {number} options.offsetLeft - scrolling stop offset to left
 */
function scrollIntoView(elem) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$onlyScrollIfNeed = _ref.onlyScrollIfNeeded;
    var onlyScrollIfNeeded = _ref$onlyScrollIfNeed === undefined ? false : _ref$onlyScrollIfNeed;
    var _ref$offsetTop = _ref.offsetTop;
    var offsetTop = _ref$offsetTop === undefined ? 0 : _ref$offsetTop;
    var _ref$offsetLeft = _ref.offsetLeft;
    var offsetLeft = _ref$offsetLeft === undefined ? 0 : _ref$offsetLeft;

    var _ref2 = _utils.getPrivateProp.call(this);

    var targets = _ref2.targets;
    var bounding = _ref2.bounding;


    if (!elem || !targets.container.contains(elem)) return;

    var targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && _isVisible.isVisible.call(this, elem)) return;

    _render.setMovement.call(this, targetBounding.left - bounding.left - offsetLeft, targetBounding.top - bounding.top - offsetTop);
};