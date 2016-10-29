import {
    getPrivateProp,
} from '../utils/';

/**
 * Add dom event listeners
 * @private
 * @param {element} elem - target element
 * @param {string} events - a list of event names splitted with space
 * @param {function} handler - event handler function
 */
export function addEvent(elem, events, handler) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError(`expect elem to be a DOM element, but got ${elem}`);
    }

    const handlerStore = this::getPrivateProp('eventHandlers');

    // wrap original handler
    const fn = (evt, ...args) => {
        // ignore default prevented events or user ignored events
        if ((!evt.type.match(/drag/) && evt.defaultPrevented)) return;

        handler(evt, ...args);
    };

    events.split(/\s+/g).forEach((evt) => {
        handlerStore.push({ evt, elem, fn, hasRegistered: true });

        elem.addEventListener(evt, fn);
    });
};
