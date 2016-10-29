'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isVisible = isVisible;

var _utils = require('../utils/');

/**
 * Check if an element is visible
 * @public
 * @param  {element} target - Target element
 * @return {boolean}
 */
function isVisible(elem) {
    var _ref = _utils.getPrivateProp.call(this);

    var bounding = _ref.bounding;


    var targetBounding = elem.getBoundingClientRect();

    // check overlapping
    var top = Math.max(bounding.top, targetBounding.top);
    var left = Math.max(bounding.left, targetBounding.left);
    var right = Math.min(bounding.right, targetBounding.right);
    var bottom = Math.min(bounding.bottom, targetBounding.bottom);

    return top < bottom && left < right;
};