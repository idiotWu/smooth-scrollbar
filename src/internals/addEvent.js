/**
 * @module
 * @prototype {Function} addEvent
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function addEvent(elem, events, handler) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError(`expect elem to be a DOM element, but got ${elem}`);
    }

    events.split(/\s+/g).forEach((evt) => {
        this.__handlers.push({ evt, elem, handler });

        elem.addEventListener(evt, handler);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, 'addEvent', {
    value: addEvent,
    writable: true,
    configurable: true
});