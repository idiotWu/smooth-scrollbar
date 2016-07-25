'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

function __updateBounding() {
    var container = this.targets.container;

    var _container$getBoundin = container.getBoundingClientRect();

    var top = _container$getBoundin.top;
    var right = _container$getBoundin.right;
    var bottom = _container$getBoundin.bottom;
    var left = _container$getBoundin.left;
    var _window = window;
    var innerHeight = _window.innerHeight;
    var innerWidth = _window.innerWidth;


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