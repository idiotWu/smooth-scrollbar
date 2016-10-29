'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.setStyle = setStyle;
var VENDOR_PREFIX = ['webkit', 'moz', 'ms', 'o'];

var RE = new RegExp('^-(?!(?:' + VENDOR_PREFIX.join('|') + ')-)');

var autoPrefix = function autoPrefix(styles) {
    var res = {};

    (0, _keys2.default)(styles).forEach(function (prop) {
        if (!RE.test(prop)) {
            res[prop] = styles[prop];
            return;
        }

        var val = styles[prop];

        prop = prop.replace(/^-/, '');
        res[prop] = val;

        VENDOR_PREFIX.forEach(function (prefix) {
            res['-' + prefix + '-' + prop] = val;
        });
    });

    return res;
};

/**
 * Set CSS styles for target element
 *
 * @param {element} elem - Target element
 * @param {object} styles - CSS styles to apply
 */
function setStyle(elem, styles) {
    styles = autoPrefix(styles);

    (0, _keys2.default)(styles).forEach(function (prop) {
        var cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, function (m, $1) {
            return $1.toUpperCase();
        });
        elem.style[cssProp] = styles[prop];
    });
};