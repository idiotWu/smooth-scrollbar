'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

/**
 * @method
 * @api
 * Set scrollbar options
 *
 * @param {Object} options
 */
_smooth_scrollbar.SmoothScrollbar.prototype.setOptions = function () {
  var _this = this;

  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var res = {};

  Object.keys(options).forEach(function (prop) {
    if (!_this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

    res[prop] = options[prop];
  });

  Object.assign(this.options, res);
}; /**
    * @module
    * @prototype {Function} setOptions
    */