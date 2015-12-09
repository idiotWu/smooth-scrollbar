/**
 * @module
 * @prototype {Function} __updateChildren
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { selectors } from '../shared/selectors';

export { SmoothScrollbar };

function __updateChildren() {
    Object.defineProperty(this, '__children', {
        value: [...this.__targets.content.querySelectorAll(selectors)],
        writable: true
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateChildren', {
    value: __updateChildren,
    writable: true,
    configurable: true
});
