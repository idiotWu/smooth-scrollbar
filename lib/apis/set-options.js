'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Set scrollbar options
 *
 * @param {Object} options
 */
_smoothScrollbar.SmoothScrollbar.prototype.setOptions = function () {
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