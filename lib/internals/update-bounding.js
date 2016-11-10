'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

function __updateBounding() {
    var container = this.targets.container;

    var _container$getBoundin = container.getBoundingClientRect(),
        top = _container$getBoundin.top,
        right = _container$getBoundin.right,
        bottom = _container$getBoundin.bottom,
        left = _container$getBoundin.left;

    var _window = window,
        innerHeight = _window.innerHeight,
        innerWidth = _window.innerWidth;


    this.__readonly('bounding', {
        top: Math.max(top, 0),
        right: Math.min(right, innerWidth),
        bottom: Math.min(bottom, innerHeight),
        left: Math.max(left, 0)
    });
} /**
   * @module
   * @prototype {Function} __updateBounding
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__updateBounding', {
    value: __updateBounding,
    writable: true,
    configurable: true
});