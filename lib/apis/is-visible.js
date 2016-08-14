'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Check if an element is visible
 *
 * @param  {Element} target  target element
 * @return {Boolean}
 */
_smoothScrollbar.SmoothScrollbar.prototype.isVisible = function (elem) {
  var bounding = this.bounding;


  var targetBounding = elem.getBoundingClientRect();

  // check overlapping
  var top = Math.max(bounding.top, targetBounding.top);
  var left = Math.max(bounding.left, targetBounding.left);
  var right = Math.min(bounding.right, targetBounding.right);
  var bottom = Math.min(bounding.bottom, targetBounding.bottom);

  return top < bottom && left < right;
}; /**
    * @module
    * @prototype {Function} isVisible
    */