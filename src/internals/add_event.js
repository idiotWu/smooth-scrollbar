/**
 * @module
 * @prototype {Function} __addEvent
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __addEvent(elem, events, fn) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError(`expect elem to be a DOM element, but got ${elem}`);
    }

    events.split(/\s+/g).forEach((evt) => {
        this.__handlers.push({ evt, elem, fn });

        elem.addEventListener(evt, fn);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__addEvent', {
    value: __addEvent,
    writable: true,
    configurable: true
});