/**
 * @module
 * @prototype {Function} __initScrollbar
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

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
function __initScrollbar() {
    this.update(); // initialize thumb position

    this.__keyboardHandler();
    this.__resizeHandler();
    this.__selectHandler();
    this.__mouseHandler();
    this.__touchHandler();
    this.__wheelHandler();
    this.__dragHandler();

    this.__render();
};

Object.defineProperty(SmoothScrollbar.prototype, '__initScrollbar', {
    value: __initScrollbar,
    writable: true,
    configurable: true,
});
