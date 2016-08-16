'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('./smooth-scrollbar');

var _shared = require('./shared');

require('./apis/');

require('./render/');

require('./events/');

require('./internals/');



function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

exports.default = _smoothScrollbar.SmoothScrollbar;


_smoothScrollbar.SmoothScrollbar.version = "7.2.6";

/**
 * init scrollbar on given element
 *
 * @param {Element} elem: target element
 * @param {Object} options: scrollbar options
 *
 * @return {Scrollbar} scrollbar instance
 */
_smoothScrollbar.SmoothScrollbar.init = function (elem, options) {
    if (!elem || elem.nodeType !== 1) {
        throw new TypeError('expect element to be DOM Element, but got ' + (typeof elem === 'undefined' ? 'undefined' : _typeof(elem)));
    }

    if (_shared.sbList.has(elem)) return _shared.sbList.get(elem);

    elem.setAttribute('data-scrollbar', '');

    var childNodes = [].concat(_toConsumableArray(elem.childNodes));

    var div = document.createElement('div');

    div.innerHTML = '\n        <article class="scroll-content"></article>\n        <aside class="scrollbar-track scrollbar-track-x">\n            <div class="scrollbar-thumb scrollbar-thumb-x"></div>\n        </aside>\n        <aside class="scrollbar-track scrollbar-track-y">\n            <div class="scrollbar-thumb scrollbar-thumb-y"></div>\n        </aside>\n        <canvas class="overscroll-glow"></canvas>\n    ';

    var scrollContent = div.querySelector('.scroll-content');

    [].concat(_toConsumableArray(div.childNodes)).forEach(function (el) {
        return elem.appendChild(el);
    });

    childNodes.forEach(function (el) {
        return scrollContent.appendChild(el);
    });

    return new _smoothScrollbar.SmoothScrollbar(elem, options);
};

/**
 * init scrollbars on pre-defined selectors
 *
 * @param {Object} options: scrollbar options
 *
 * @return {Array} a collection of scrollbar instances
 */
_smoothScrollbar.SmoothScrollbar.initAll = function (options) {
    return [].concat(_toConsumableArray(document.querySelectorAll(_shared.selectors))).map(function (el) {
        return _smoothScrollbar.SmoothScrollbar.init(el, options);
    });
};

/**
 * check if scrollbar exists on given element
 *
 * @return {Boolean}
 */
_smoothScrollbar.SmoothScrollbar.has = function (elem) {
    return _shared.sbList.has(elem);
};

/**
 * get scrollbar instance through given element
 *
 * @param {Element} elem: target scrollbar container
 *
 * @return {Scrollbar}
 */
_smoothScrollbar.SmoothScrollbar.get = function (elem) {
    return _shared.sbList.get(elem);
};

/**
 * get all scrollbar instances
 *
 * @return {Array} a collection of scrollbars
 */
_smoothScrollbar.SmoothScrollbar.getAll = function () {
    return [].concat(_toConsumableArray(_shared.sbList.values()));
};

/**
 * destroy scrollbar on given element
 *
 * @param {Element} elem: target scrollbar container
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smoothScrollbar.SmoothScrollbar.destroy = function (elem, isRemoval) {
    return _smoothScrollbar.SmoothScrollbar.has(elem) && _smoothScrollbar.SmoothScrollbar.get(elem).destroy(isRemoval);
};

/**
 * destroy all scrollbars in scrollbar instances
 *
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smoothScrollbar.SmoothScrollbar.destroyAll = function (isRemoval) {
    _shared.sbList.forEach(function (sb) {
        sb.destroy(isRemoval);
    });
};
module.exports = exports['default'];