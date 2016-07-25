'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

function __addEvent(elem, events, handler) {
    var _this = this;

    if (!elem || typeof elem.addEventListener !== 'function') {
        throw new TypeError('expect elem to be a DOM element, but got ' + elem);
    }

    var fn = function fn(evt) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        // ignore default prevented events or user ignored events
        if (!evt.type.match(/drag/) && evt.defaultPrevented) return;

        handler.apply(undefined, [evt].concat(args));
    };

    events.split(/\s+/g).forEach(function (evt) {
        _this.__handlers.push({ evt: evt, elem: elem, fn: fn, hasRegistered: true });

        elem.addEventListener(evt, fn);
    });
} /**
   * @module
   * @prototype {Function} __addEvent
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__addEvent', {
    value: __addEvent,
    writable: true,
    configurable: true
});