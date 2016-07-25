/**
 * @module
 * @prototype {Function} __readonly
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @internal
 * create readonly property
 *
 * @param {String} prop
 * @param {Any} value
 */
function __readonly(prop, value) {
    return Object.defineProperty(this, prop, {
        value,
        enumerable: true,
        configurable: true,
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__readonly', {
    value: __readonly,
    writable: true,
    configurable: true,
});
