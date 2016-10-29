'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addEvent = addEvent;

var _utils = require('../utils/');

/**
 * Add dom event listeners
 * @private
 * @param {element} elem - target element
 * @param {string} events - a list of event names splitted with space
 * @param {function} handler - event handler function
 */
function addEvent(elem, events, handler) {
    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError('expect elem to be a DOM element, but got ' + elem);
    }

    var handlerStore = _utils.getPrivateProp.call(this, 'eventHandlers');

    // wrap original handler
    var fn = function fn(evt) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        // ignore default prevented events or user ignored events
        if (!evt.type.match(/drag/) && evt.defaultPrevented) return;

        handler.apply(undefined, [evt].concat(args));
    };

    events.split(/\s+/g).forEach(function (evt) {
        handlerStore.push({ evt: evt, elem: elem, fn: fn, hasRegistered: true });

        elem.addEventListener(evt, fn);
    });
};