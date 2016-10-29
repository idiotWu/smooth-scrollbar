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
    var _ref = _utils.getPrivateProp.call(this, 'targets');

    var container = _ref.container;

    var _container$getBoundin = container.getBoundingClientRect();

    var top = _container$getBoundin.top;
    var right = _container$getBoundin.right;
    var bottom = _container$getBoundin.bottom;
    var left = _container$getBoundin.left;
    var _window = window;
    var innerHeight = _window.innerHeight;
    var innerWidth = _window.innerWidth;


    _utils.setPrivateProp.call(this, 'bounding', {
        top: Math.max(top, 0),
        right: Math.min(right, innerWidth),
        bottom: Math.min(bottom, innerHeight),
        left: Math.max(left, 0)
    });
};