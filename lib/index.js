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
exports.default = undefined;

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _class, _class2, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _contants = require('./contants/');

var _helpers = require('./helpers/');

var _core = require('./modules/core/');

var _utils = require('./modules/utils/');

var _apis = require('./modules/apis/');

var APIs = _interopRequireWildcard(_apis);



function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SmoothScrollbar = (_dec = (0, _helpers.apiMixin)(APIs), _dec(_class = (_temp = _class2 = function () {
    /**
     * Create scrollbar instance
     * @constructor
     * @param {element} container - target element
     * @param {object} [options] - options
     */
    function SmoothScrollbar(container, options) {
        _classCallCheck(this, SmoothScrollbar);

        _core.init.call(this, container, options);

        // storage
        _core.ScbList.set(container, this);
    }

    // eslint-disable-next-line spaced-comment
    /******************* Alias *******************/


    _createClass(SmoothScrollbar, [{
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
        key: 'containerElement',
        get: function get() {
            return this.targets.container;
        }
    }, {
        key: 'contentElement',
        get: function get() {
            return this.targets.content;
        }
    }, {
        key: 'scrollTop',
        get: function get() {
            return this.offset.y;
        }
    }, {
        key: 'scrollLeft',
        get: function get() {
            return this.offset.x;
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

            if (_core.ScbList.has(elem)) return _core.ScbList.get(elem);

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
            return _core.ScbList.has(elem);
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
            return _core.ScbList.get(elem);
        }
    }, {
        key: 'getAll',


        /**
         * Get all scrollbar instances
         * @static
         * @return {SmoothScrollbar[]} - a collection of scrollbars
         */
        value: function getAll() {
            return [].concat(_toConsumableArray(_core.ScbList.values()));
        }
    }, {
        key: 'destroy',


        /**
         * Destroy scrollbar on given element
         * @static
         * @param {element} elem - target scrollbar container
         * @param {boolean} [isRemoval] - Whether node is being removd from DOM
         */
        value: function destroy(elem, isRemoval) {
            return SmoothScrollbar.has(elem) && SmoothScrollbar.get(elem).destroy(isRemoval);
        }
    }, {
        key: 'destroyAll',


        /**
         * Destroy all scrollbars in scrollbar instances
         * @static
         * @param {boolean} [isRemoval] - Whether node is being removed from DOM
         */
        value: function destroyAll(isRemoval) {
            _core.ScbList.forEach(function (scb) {
                scb.destroy(isRemoval);
            });
        }
    }]);

    return SmoothScrollbar;
}(), _class2.version = "7.2.9", _temp)) || _class);
exports.default = SmoothScrollbar;
module.exports = exports['default'];