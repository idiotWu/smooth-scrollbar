'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @internal
 * Resize event handler builder
 */
function __resizeHandler() {
  this.__addEvent(window, 'resize', this.__updateThrottle);
} /**
   * @module
   * @prototype {Function} __resizeHandler
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__resizeHandler', {
  value: __resizeHandler,
  writable: true,
  configurable: true
});