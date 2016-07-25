/**
 * @module
 * @prototype {Function} __eventFromChildScrollbar
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

function __eventFromChildScrollbar({ target } = {}) {
    return this.children.some((sb) => sb.contains(target));
};

Object.defineProperty(SmoothScrollbar.prototype, '__eventFromChildScrollbar', {
    value: __eventFromChildScrollbar,
    writable: true,
    configurable: true,
});
