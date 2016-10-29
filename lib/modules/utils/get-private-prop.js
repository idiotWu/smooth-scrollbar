'use strict';

var _iterator = require('babel-runtime/core-js/symbol/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getPrivateProp = getPrivateProp;

var _contants = require('../../contants/');

/**
 * Get private prop(s)
 * @private
 * @param {string} [prop] - Specify the property to be got, or the whole private props
 * @return {any}
 */
function getPrivateProp(prop) {
    var privateProps = this[_contants.PRIVATE_PROPS];

    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === undefined) {
        return privateProps;
    }

    return privateProps[prop];
};