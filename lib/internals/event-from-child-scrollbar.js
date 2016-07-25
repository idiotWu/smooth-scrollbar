'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

function __eventFromChildScrollbar() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var target = _ref.target;

    return this.children.some(function (sb) {
        return sb.contains(target);
    });
} /**
   * @module
   * @prototype {Function} __eventFromChildScrollbar
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__eventFromChildScrollbar', {
    value: __eventFromChildScrollbar,
    writable: true,
    configurable: true
});