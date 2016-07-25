'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

/**
 * @method
 * @api
 * Add scrolling listener
 *
 * @param {Function} cb: listener
 */
_smooth_scrollbar.SmoothScrollbar.prototype.addListener = function (cb) {
  if (typeof cb !== 'function') return;

  this.__listeners.push(cb);
};

/**
 * @method
 * @api
 * Remove specific listener from all listeners
 * @param {type} param: description
 */
/**
 * @module
 * @prototype {Function} addListener
 *            {Function} removeListener
 */

_smooth_scrollbar.SmoothScrollbar.prototype.removeListener = function (cb) {
  if (typeof cb !== 'function') return;

  this.__listeners.some(function (fn, idx, all) {
    return fn === cb && all.splice(idx, 1);
  });
};