'use strict';

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/reflect/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _defineProperty = require('babel-runtime/core-js/reflect/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _ownKeys = require('babel-runtime/core-js/reflect/own-keys');

var _ownKeys2 = _interopRequireDefault(_ownKeys);

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.setPrivateProp = setPrivateProp;

var _contants = require('../../contants/');

/**
 * Define/Update private prop(s) on instance
 * @private
 * @param {string|object} prop - Property name, or an object descripts { prop: value }
 * @param {any} value
 * @return {this}
 */
function setPrivateProp(prop, value) {
    var privateProps = this[_contants.PRIVATE_PROPS];

    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'object') {
        (function () {
            var src = prop;
            (0, _ownKeys2.default)(src).forEach(function (key) {
                (0, _defineProperty2.default)(privateProps, key, (0, _getOwnPropertyDescriptor2.default)(src, key));
            });
        })();
    } else {
        privateProps[prop] = value;
    }

    return this;
};