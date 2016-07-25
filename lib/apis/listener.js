'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Add scrolling listener
 *
 * @param {Function} cb: listener
 */
_smoothScrollbar.SmoothScrollbar.prototype.addListener = function (cb) {
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

_smoothScrollbar.SmoothScrollbar.prototype.removeListener = function (cb) {
  if (typeof cb !== 'function') return;

  this.__listeners.some(function (fn, idx, all) {
    return fn === cb && all.splice(idx, 1);
  });
};