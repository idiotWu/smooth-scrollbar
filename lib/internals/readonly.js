'use strict';

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
    return Object.defineProperty(this, prop, {
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