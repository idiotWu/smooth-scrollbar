/**
 * @module
 * @prototype {Function} $on
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function $on(events, elem, handler) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError(`expect elem to be a DOM element, but got ${elem}`);
    }

    events.split(/\s+/g).forEach((evt) => {
        this.__handlers.push({ evt, elem, handler });

        elem.addEventListener(evt, handler);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '$on', {
    value: $on,
    writable: true,
    configurable: true
});