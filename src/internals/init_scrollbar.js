/**
 * @module
 * @prototype {Function} __initScrollbar
 * @dependencies [ SmoothScrollbar, '../events' ]
 */

import '../events/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };


/**
 * @method
 * @internal
 * initialize scrollbar
 *
 * This method will attach several listeners to elements
 * and create a destroy method to remove listeners
 *
 * @param {Object} option: as is explained in constructor
 */
function __initScrollbar(options) {
    this.update(); // initialize thumb position

    this.__keyboardHandler(options);
    this.__mouseHandler(options);
    this.__resizeHandler(options);
    this.__touchHandler(options);
    this.__wheelHandler(options);
};

Object.defineProperty(SmoothScrollbar.prototype, '__initScrollbar', {
    value: __initScrollbar,
    writable: true,
    configurable: true
});
