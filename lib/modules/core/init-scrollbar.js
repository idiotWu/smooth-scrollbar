'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initScrollbar = initScrollbar;

var _events = require('../events/');

var _apis = require('../apis/');

var _render = require('../render/');

var _initPrivates = require('./init-privates');

var _initOptions = require('./init-options');

var _initTargets = require('./init-targets');

/**
 * Initialize scrollbar
 * @private
 * @param {element} container - Scrollbar container
 * @param {object} [options] - Init options
 */
function initScrollbar(container) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // init vars
    _initPrivates.initPrivates.call(this);
    _initTargets.initTargets.call(this, container);
    _initOptions.initOptions.call(this, options);

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