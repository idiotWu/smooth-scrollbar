'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @internal
 * create readonly property
 *
 * @param {String} prop
 * @param {Any} value
 */
function __readonly(prop, value) {
    return (0, _defineProperty2.default)(this, prop, {
        value: value,
        enumerable: true,
        configurable: true
    });
} /**
   * @module
   * @prototype {Function} __readonly
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__readonly', {
    value: __readonly,
    writable: true,
    configurable: true
});