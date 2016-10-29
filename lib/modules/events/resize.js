'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleResizeEvents = handleResizeEvents;

var _dom = require('../dom/');

var _utils = require('../utils/');

/**
 * Resize events handlers
 * @private
 */
function handleResizeEvents() {
    _dom.addEvent.call(this, window, 'resize', _utils.getPrivateMethod.call(this, 'updateThrottle'));
};