'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateBounding = updateBounding;

var _utils = require('../utils/');

/**
 * Update container's bounding rect
 * @private
 */
function updateBounding() {
    var _ref = _utils.getPrivateProp.call(this, 'targets'),
        container = _ref.container;

    var _container$getBoundin = container.getBoundingClientRect(),
        top = _container$getBoundin.top,
        right = _container$getBoundin.right,
        bottom = _container$getBoundin.bottom,
        left = _container$getBoundin.left;

    var _window = window,
        innerHeight = _window.innerHeight,
        innerWidth = _window.innerWidth;


    _utils.setPrivateProp.call(this, 'bounding', {
        top: Math.max(top, 0),
        right: Math.min(right, innerWidth),
        bottom: Math.min(bottom, innerHeight),
        left: Math.max(left, 0)
    });
};