/**
 * @module
 * @prototype {Function} __updateChildren
 * @dependencies [ SmoothScrollbar, selectors, #__readonly ]
 */

import '../internals';
import { SmoothScrollbar } from '../smooth_scrollbar';
import { selectors } from '../shared/selectors';

export { SmoothScrollbar };

function __updateChildren() {
    this.__readonly('children', [...this.targets.content.querySelectorAll(selectors)]);
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateChildren', {
    value: __updateChildren,
    writable: true,
    configurable: true
});
