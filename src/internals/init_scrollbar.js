/**
 * @module
 * @prototype {Function} __initScrollbar
 */

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
    this.__resizeHandler(options);
    this.__selectHandler(options);
    this.__mouseHandler(options);
    this.__touchHandler(options);
    this.__wheelHandler(options);
    this.__dragHandler(options);
};

Object.defineProperty(SmoothScrollbar.prototype, '__initScrollbar', {
    value: __initScrollbar,
    writable: true,
    configurable: true
});
