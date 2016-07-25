'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

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

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__resizeHandler', {
  value: __resizeHandler,
  writable: true,
  configurable: true
});