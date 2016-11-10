"use strict";

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.memoize = memoize;
/**
 * Memoize getters
 * @param {object} source - { getter() {} }
 * @return {object}
 */
function memoize(source) {
    var res = {};
    var cache = {};

    (0, _keys2.default)(source).forEach(function (prop) {
        (0, _defineProperty2.default)(res, prop, {
            get: function get() {
                if (!cache.hasOwnProperty(prop)) {
                    var getter = source[prop];

                    cache[prop] = getter();
                }

                return cache[prop];
            }
        });
    });

    return res;
};