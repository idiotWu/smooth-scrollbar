'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initScrollbar = initScrollbar;

var _events = require('../events/');

var _apis = require('../apis/');

var _render = require('../render/');

/**
 * Initialize scrollbar
 * @private
 */
function initScrollbar() {
    _apis.update.call(this); // initialize thumb position

    _events.handleKeyboardEvents.call(this);
    _events.handleResizeEvents.call(this);
    _events.handleSelectEvents.call(this);
    _events.handleMouseEvents.call(this);
    _events.handleTouchEvents.call(this);
    _events.handleWheelEvents.call(this);
    _events.handleDragEvents.call(this);

    _render.render.call(this);
};