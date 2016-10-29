'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _contants = require('./contants/');

var _core = require('./modules/core/');

var _utils = require('./modules/utils/');

var _apis = require('./modules/apis/');



function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SmoothScrollbar = function () {
    /**
     * Create scrollbar instance
     * @constructor
     * @param {element} container - target element
     * @param {object} [options] - options
     */
    function SmoothScrollbar(container, options) {
        _classCallCheck(this, SmoothScrollbar);

        _core.initScrollbar.call(this, container, options);

        // storage
        _contants.ScbList.set(container, this);
    }

    // eslint-disable-next-line spaced-comment
    /******************* Alias *******************/


    _createClass(SmoothScrollbar, [{
        key: 'clearMovement',


        // eslint-disable-next-line spaced-comment
        /******************* APIs *******************/
        value: function clearMovement() {
            return _apis.clearMovement.call(this);
        }
    }, {
        key: 'stop',
        value: function stop() {
            return _apis.stop.call(this);
        }
    }, {
        key: 'destroy',
        value: function destroy(isRemoval) {
            return _apis.destroy.call(this, isRemoval);
        }
    }, {
        key: 'getContentElem',
        value: function getContentElem() {
            return _apis.getContentElem.call(this);
        }
    }, {
        key: 'getSize',
        value: function getSize() {
            return _apis.getSize.call(this);
        }
    }, {
        key: 'infiniteScroll',
        value: function infiniteScroll(cb, threshold) {
            return _apis.infiniteScroll.call(this, cb, threshold);
        }
    }, {
        key: 'isVisible',
        value: function isVisible(elem) {
            return _apis.isVisible.call(this, elem);
        }
    }, {
        key: 'addListener',
        value: function addListener(cb) {
            return _apis.addListener.call(this, cb);
        }
    }, {
        key: 'removeListener',
        value: function removeListener(cb) {
            return _apis.removeListener.call(this, cb);
        }
    }, {
        key: 'registerEvents',
        value: function registerEvents() {
            return _apis.registerEvents.call.apply(_apis.registerEvents, [this].concat(Array.prototype.slice.call(arguments)));
        }
    }, {
        key: 'unregisterEvents',
        value: function unregisterEvents() {
            return _apis.unregisterEvents.call.apply(_apis.unregisterEvents, [this].concat(Array.prototype.slice.call(arguments)));
        }
    }, {
        key: 'scrollIntoView',
        value: function scrollIntoView(elem, options) {
            return _apis.scrollIntoView.call(this, elem, options);
        }
    }, {
        key: 'scrollTo',
        value: function scrollTo(x, y, duration, cb) {
            return _apis.scrollTo.call(this, x, y, duration, cb);
        }
    }, {
        key: 'setOptions',
        value: function setOptions(opts) {
            return _apis.setOptions.call(this, opts);
        }
    }, {
        key: 'setPosition',
        value: function setPosition(x, y, withoutCallbacks) {
            return _apis.setPosition.call(this, x, y, withoutCallbacks);
        }
    }, {
        key: 'showTrack',
        value: function showTrack(direction) {
            return _apis.showTrack.call(this, direction);
        }
    }, {
        key: 'hideTrack',
        value: function hideTrack(direction) {
            return _apis.hideTrack.call(this, direction);
        }
    }, {
        key: 'update',
        value: function update(inAsync) {
            return _apis.update.call(this, inAsync);
        }
    }, {
        key: 'contentElement',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'targets').content;
        }
    }, {
        key: 'targets',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'targets');
        }
    }, {
        key: 'offset',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'offset');
        }
    }, {
        key: 'limit',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'limit');
        }
    }, {
        key: 'scrollTop',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'offset').y;
        }
    }, {
        key: 'scrollLeft',
        get: function get() {
            return _utils.getPrivateProp.call(this, 'offset').x;
        }

        // eslint-disable-next-line spaced-comment
        /******************* Static Methods *******************/

    }], [{
        key: 'init',


        /**
         * Initialize scrollbar on given element
         * @static
         * @param {element} elem - Target element
         * @param {object} options - Scrollbar options
         * @return {SmoothScrollbar}
         */
        value: function init(elem, options) {
            if (!elem || elem.nodeType !== 1) {
                throw new TypeError('expect element to be DOM Element, but got ' + (typeof elem === 'undefined' ? 'undefined' : _typeof(elem)));
            }

            if (_contants.ScbList.has(elem)) return _contants.ScbList.get(elem);

            elem.setAttribute('data-scrollbar', '');

            var childNodes = [].concat(_toConsumableArray(elem.childNodes));

            var div = document.createElement('div');

            div.innerHTML = '\n            <article class="scroll-content"></article>\n            <aside class="scrollbar-track scrollbar-track-x">\n                <div class="scrollbar-thumb scrollbar-thumb-x"></div>\n            </aside>\n            <aside class="scrollbar-track scrollbar-track-y">\n                <div class="scrollbar-thumb scrollbar-thumb-y"></div>\n            </aside>\n            <canvas class="overscroll-glow"></canvas>\n        ';

            var scrollContent = div.querySelector('.scroll-content');

            [].concat(_toConsumableArray(div.childNodes)).forEach(function (el) {
                return elem.appendChild(el);
            });

            childNodes.forEach(function (el) {
                return scrollContent.appendChild(el);
            });

            return new SmoothScrollbar(elem, options);
        }
    }, {
        key: 'initAll',


        /**
         * init scrollbars on pre-defined selectors
         * @static
         * @param {object} options - scrollbar options
         * @return {SmoothScrollbar[]} - a collection of scrollbar instances
         */
        value: function initAll(options) {
            return [].concat(_toConsumableArray(document.querySelectorAll(_contants.SELECTOR))).map(function (el) {
                return SmoothScrollbar.init(el, options);
            });
        }
    }, {
        key: 'has',


        /**
         * Check if scrollbar exists on given element
         * @static
         * @param {element} elem - Container element
         * @return {boolean}
         */
        value: function has(elem) {
            return _contants.ScbList.has(elem);
        }
    }, {
        key: 'get',


        /**
         * Get scrollbar instance through given element
         * @static
         * @param {element} elem - Container element
         * @return {SmoothScrollbar}
         */
        value: function get(elem) {
            return _contants.ScbList.get(elem);
        }
    }, {
        key: 'getAll',


        /**
         * Get all scrollbar instances
         * @static
         * @return {SmoothScrollbar[]} - a collection of scrollbars
         */
        value: function getAll() {
            return [].concat(_toConsumableArray(_contants.ScbList.values()));
        }
    }, {
        key: 'destroy',


        /**
         * Destroy scrollbar on given element
         * @static
         * @param {element} elem - target scrollbar container
         * @param {boolean} [isRemoval] - whether node is removing from DOM
         */
        value: function destroy(elem, isRemoval) {
            return SmoothScrollbar.has(elem) && SmoothScrollbar.get(elem).destroy(isRemoval);
        }
    }, {
        key: 'destroyAll',


        /**
         * Destroy all scrollbars in scrollbar instances
         * @static
         * @param {boolean} [isRemoval] - whether node is removing from DOM
         */
        value: function destroyAll(isRemoval) {
            _contants.ScbList.forEach(function (sb) {
                sb.destroy(isRemoval);
            });
        }
    }]);

    return SmoothScrollbar;
}();

SmoothScrollbar.version = "7.2.8";
exports.default = SmoothScrollbar;
module.exports = exports['default'];