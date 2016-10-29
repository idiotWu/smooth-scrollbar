'use strict';

var _ownKeys = require('babel-runtime/core-js/reflect/own-keys');

var _ownKeys2 = _interopRequireDefault(_ownKeys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.setOptions = setOptions;

var _utils = require('../utils/');

/**
 * Extend scrollbar options
 * @public
 * @param {Object} opts
 */
function setOptions() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref = _utils.getPrivateProp.call(this);

    var options = _ref.options;


    (0, _ownKeys2.default)(opts).forEach(function (prop) {
        if (!options.hasOwnProperty(prop) || opts[prop] === undefined) return;

        options[prop] = opts[prop];
    });
};