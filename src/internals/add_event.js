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

    let handler = fn;

    if (!this.eventPropagation) {
        handler = (e, ...args) => {
            e.stopPropagation();
            fn(e, ...args);
        };
    }

    events.split(/\s+/g).forEach((evt) => {
        this.__handlers.push({ evt, elem, handler });

        elem.addEventListener(evt, handler);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__addEvent', {
    value: __addEvent,
    writable: true,
    configurable: true
});