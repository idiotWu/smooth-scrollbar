/**
 * @module
 * @prototype {Function} __ignoreEvent
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getOriginalEvent } from '../utils/index';

export { SmoothScrollbar };

function __ignoreEvent(evt = {}) {
    const { target } = getOriginalEvent(evt);

    if (!target || target === window || !this.children) return false;

    return (!evt.type.match(/drag/) && evt.defaultPrevented)||
        this.children.some((sb) => sb.contains(target));
};

Object.defineProperty(SmoothScrollbar.prototype, '__ignoreEvent', {
    value: __ignoreEvent,
    writable: true,
    configurable: true
});