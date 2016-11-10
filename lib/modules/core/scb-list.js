'use strict';

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _species = require('babel-runtime/core-js/symbol/species');

var _species2 = _interopRequireDefault(_species);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _setPrototypeOf = require('babel-runtime/core-js/object/set-prototype-of');

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ScbList = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = (0, _getOwnPropertyDescriptor2.default)(object, property); if (desc === undefined) { var parent = (0, _getPrototypeOf2.default)(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _contants = require('../../contants/');

var _utils = require('../utils/');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass; }

var ScrollbarStore = function (_Map) {
    _inherits(ScrollbarStore, _Map);

    function ScrollbarStore() {
        _classCallCheck(this, ScrollbarStore);

        return _possibleConstructorReturn(this, (ScrollbarStore.__proto__ || (0, _getPrototypeOf2.default)(ScrollbarStore)).apply(this, arguments));
    }

    _createClass(ScrollbarStore, [{
        key: 'updateScbTree',


        /**
         * Update scrollbars tree
         * @param  {Scrollbar} scb - target scrollbar instance
         */
        value: function updateScbTree(scb) {
            var _ref = _utils.getPrivateProp.call(scb, 'targets'),
                container = _ref.container,
                content = _ref.content;

            var parents = [];

            var isNested = false;
            var elem = container;

            // eslint-disable-next-line no-cond-assign
            while (elem = elem.parentElement) {
                if (this.has(elem)) {
                    isNested = true;
                    parents.push(this.get(elem));
                }
            }

            _utils.setPrivateProp.call(scb, {
                parents: parents,
                isNestedScrollbar: isNested,
                children: (0, _from2.default)(content.querySelectorAll(_contants.SELECTOR), this.get.bind(this))
            });
        }
    }, {
        key: 'update',
        value: function update() {
            this.forEach(this.updateScbTree.bind(this));
        }

        // patch #set,#delete with #update method

    }, {
        key: 'delete',
        value: function _delete() {
            var _get2;

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var res = (_get2 = _get(ScrollbarStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(ScrollbarStore.prototype), 'delete', this)).call.apply(_get2, [this].concat(args));
            this.update();

            return res;
        }
    }, {
        key: 'set',
        value: function set() {
            var _get3;

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var res = (_get3 = _get(ScrollbarStore.prototype.__proto__ || (0, _getPrototypeOf2.default)(ScrollbarStore.prototype), 'set', this)).call.apply(_get3, [this].concat(args));
            this.update();

            return res;
        }
    }], [{
        key: _species2.default,
        get: function get() {
            return _map2.default;
        }
    }]);

    return ScrollbarStore;
}(_map2.default);

var ScbList = exports.ScbList = new ScrollbarStore();