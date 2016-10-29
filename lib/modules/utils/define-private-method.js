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

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.definePrivateMethod = definePrivateMethod;

var _contants = require('../../contants/');

/**
 * Define private method(s)
 * @private
 * @param {string|object} name - Method name, or an object descripts { name: fn }
 * @param {function} [fn] - Method body
 * @return {this}
 */
function definePrivateMethod(name, fn) {
    var privateMethods = this[_contants.PRIVATE_METHODS];

    if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
        (function () {
            var src = name;
            (0, _ownKeys2.default)(src).forEach(function (key) {
                (0, _defineProperty2.default)(privateMethods, key, (0, _getOwnPropertyDescriptor2.default)(src, key));
            });
        })();
    } else {
        privateMethods[name] = fn;
    }

    return this;
};