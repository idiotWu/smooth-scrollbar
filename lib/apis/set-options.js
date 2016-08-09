'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  (0, _keys2.default)(options).forEach(function (prop) {
    if (!_this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

    res[prop] = options[prop];
  });

  (0, _assign2.default)(this.options, res);
}; /**
    * @module
    * @prototype {Function} setOptions
    */