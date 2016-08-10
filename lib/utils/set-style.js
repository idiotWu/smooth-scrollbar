'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @module
 * @export {Function} setStyle
 */

var VENDOR_PREFIX = ['webkit', 'moz', 'ms', 'o'];

var RE = new RegExp('^-(?!(?:' + VENDOR_PREFIX.join('|') + ')-)');

var autoPrefix = function autoPrefix(styles) {
    var res = {};

    Object.keys(styles).forEach(function (prop) {
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
 * set css style for target element
 *
 * @param {Element} elem: target element
 * @param {Object} styles: css styles to apply
 */
var setStyle = exports.setStyle = function setStyle(elem, styles) {
    styles = autoPrefix(styles);

    Object.keys(styles).forEach(function (prop) {
        var cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, function (m, $1) {
            return $1.toUpperCase();
        });
        elem.style[cssProp] = styles[prop];
    });
};