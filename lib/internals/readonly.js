'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

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
   * @dependencies [ SmoothScrollbar ]
   */

;

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__readonly', {
    value: __readonly,
    writable: true,
    configurable: true
});