'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _smooth_scrollbar = require('./smooth_scrollbar');

var _shared = require('./shared');

require('./apis/');

require('./render/');

require('./events/');

require('./internals/');

require('./style/style.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _smooth_scrollbar.SmoothScrollbar;


_smooth_scrollbar.SmoothScrollbar.version = "6.4.0";

/**
 * init scrollbar on given element
 *
 * @param {Element} elem: target element
 * @param {Object} options: scrollbar options
 *
 * @return {Scrollbar} scrollbar instance
 */
_smooth_scrollbar.SmoothScrollbar.init = function (elem, options) {
    if (!elem || elem.nodeType !== 1) {
        throw new TypeError('expect element to be DOM Element, but got ' + (typeof elem === 'undefined' ? 'undefined' : (0, _typeof3.default)(elem)));
    }

    if (_shared.sbList.has(elem)) return _shared.sbList.get(elem);

    elem.setAttribute('data-scrollbar', '');

    var childNodes = [].concat((0, _toConsumableArray3.default)(elem.childNodes));

    var div = document.createElement('div');

    div.innerHTML = '\n        <article class="scroll-content"></article>\n        <aside class="scrollbar-track scrollbar-track-x">\n            <div class="scrollbar-thumb scrollbar-thumb-x"></div>\n        </aside>\n        <aside class="scrollbar-track scrollbar-track-y">\n            <div class="scrollbar-thumb scrollbar-thumb-y"></div>\n        </aside>\n        <canvas class="overscroll-glow"></canvas>\n    ';

    var scrollContent = div.querySelector('.scroll-content');

    [].concat((0, _toConsumableArray3.default)(div.childNodes)).forEach(function (el) {
        return elem.appendChild(el);
    });

    childNodes.forEach(function (el) {
        return scrollContent.appendChild(el);
    });

    return new _smooth_scrollbar.SmoothScrollbar(elem, options);
};

/**
 * init scrollbars on pre-defined selectors
 *
 * @param {Object} options: scrollbar options
 *
 * @return {Array} a collection of scrollbar instances
 */
_smooth_scrollbar.SmoothScrollbar.initAll = function (options) {
    return [].concat((0, _toConsumableArray3.default)(document.querySelectorAll(_shared.selectors))).map(function (el) {
        return _smooth_scrollbar.SmoothScrollbar.init(el, options);
    });
};

/**
 * check if scrollbar exists on given element
 *
 * @return {Boolean}
 */
_smooth_scrollbar.SmoothScrollbar.has = function (elem) {
    return _shared.sbList.has(elem);
};

/**
 * get scrollbar instance through given element
 *
 * @param {Element} elem: target scrollbar container
 *
 * @return {Scrollbar}
 */
_smooth_scrollbar.SmoothScrollbar.get = function (elem) {
    return _shared.sbList.get(elem);
};

/**
 * get all scrollbar instances
 *
 * @return {Array} a collection of scrollbars
 */
_smooth_scrollbar.SmoothScrollbar.getAll = function () {
    return [].concat((0, _toConsumableArray3.default)(_shared.sbList.values()));
};

/**
 * destroy scrollbar on given element
 *
 * @param {Element} elem: target scrollbar container
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smooth_scrollbar.SmoothScrollbar.destroy = function (elem, isRemoval) {
    return _smooth_scrollbar.SmoothScrollbar.has(elem) && _smooth_scrollbar.SmoothScrollbar.get(elem).destroy(isRemoval);
};

/**
 * destroy all scrollbars in scrollbar instances
 *
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smooth_scrollbar.SmoothScrollbar.destroyAll = function (isRemoval) {
    _shared.sbList.forEach(function (sb) {
        sb.destroy(isRemoval);
    });
};
module.exports = exports['default'];