/**
 * @module
 * @prototype {Function} __fromChild
 * @dependencies [ SmoothScrollbar, getOriginalEvent ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getOriginalEvent } from '../utils/index';

export { SmoothScrollbar };

function __fromChild(evt = {}) {
    const { target } = getOriginalEvent(evt);

    if (!target || !this.children) return false;

    return this.children.some((sb) => sb.contains(target));
};

Object.defineProperty(SmoothScrollbar.prototype, '__fromChild', {
    value: __fromChild,
    writable: true,
    configurable: true
});