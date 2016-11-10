"use strict";

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.apiMixin = apiMixin;
/**
 * API mixin decorator
 * @decorator
 * @param {object} source
 */
function apiMixin(source) {
    return function (Constructor) {
        (0, _keys2.default)(source).forEach(function (key) {
            (0, _defineProperty2.default)(Constructor.prototype, key, {
                value: source[key],
                enumerable: false,
                writable: true,
                configurable: true
            });
        });
    };
}