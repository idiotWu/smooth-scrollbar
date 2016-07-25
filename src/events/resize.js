/**
 * @module
 * @prototype {Function} __resizeHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @internal
 * Resize event handler builder
 */
function __resizeHandler() {
    this.__addEvent(window, 'resize', this.__updateThrottle);
};

Object.defineProperty(SmoothScrollbar.prototype, '__resizeHandler', {
    value: __resizeHandler,
    writable: true,
    configurable: true,
});
