/**
 * @module
 * @prototype {Function} __readonly
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };


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
        enumerable: true,
        configurable: true,
        get() {
            return value;
        }
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__readonly', {
    value: __readonly,
    writable: true,
    configurable: true
});
