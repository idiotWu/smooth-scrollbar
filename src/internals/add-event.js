/**
 * @module
 * @prototype {Function} __addEvent
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

function __addEvent(elem, events, handler) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError(`expect elem to be a DOM element, but got ${elem}`);
    }

    const fn = (evt, ...args) => {
        // ignore default prevented events or user ignored events
        if ((!evt.type.match(/drag/) && evt.defaultPrevented)) return;

        handler(evt, ...args);
    };

    events.split(/\s+/g).forEach((evt) => {
        this.__handlers.push({ evt, elem, fn, hasRegistered: true });

        elem.addEventListener(evt, fn);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__addEvent', {
    value: __addEvent,
    writable: true,
    configurable: true,
});
