/**
 * @module
 * @prototype {Function} __updateBounding
 * @dependencies [ SmoothScrollbar, selectors, #__readonly ]
 */

import '../internals';
import { SmoothScrollbar } from '../smooth_scrollbar';
import { selectors } from '../shared/selectors';

export { SmoothScrollbar };

function __updateBounding() {
    this.__readonly('bounding', this.targets.container.getBoundingClientRect());
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateBounding', {
    value: __updateBounding,
    writable: true,
    configurable: true
});
