'use strict';

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getPrivateMethod = getPrivateMethod;

var _contants = require('../../contants/');

/**
 * Get private method(s)
 * @private
 * @param {string} [name] - Specify the method to be got, or the whole private methods
 * @return {any}
 */
function getPrivateMethod(name) {
    var _this = this;

    var privateMethods = this[_contants.PRIVATE_METHODS];

    if (typeof name === 'undefined') {
        var _ret = function () {
            var res = {};

            Reflect.keys(privateMethods).forEach(function (key) {
                res[key] = privateMethods[key].bind(_this);
            });

            return {
                v: res
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    return privateMethods[name].bind(this);
};