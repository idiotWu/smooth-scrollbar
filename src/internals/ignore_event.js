/**
 * @module
 * @prototype {Function} __ignoreEvent
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getOriginalEvent } from '../utils/';

export { SmoothScrollbar };

function __ignoreEvent(evt = {}, allowChild = false) {
    const { target } = getOriginalEvent(evt);

    return (!evt.type.match(/drag/) && evt.defaultPrevented) ||
        this.options.ignoreEvents.some(rule => evt.type.match(rule)) ||
        (allowChild ? false : this.children.some((sb) => sb.contains(target)));
};

Object.defineProperty(SmoothScrollbar.prototype, '__ignoreEvent', {
    value: __ignoreEvent,
    writable: true,
    configurable: true
});