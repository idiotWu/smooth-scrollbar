'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _smooth_scrollbar = require('../smooth_scrollbar');

var _utils = require('../utils');

var _shared = require('../shared');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method
 * @api
 * Remove all scrollbar listeners and event handlers
 *
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smooth_scrollbar.SmoothScrollbar.prototype.destroy = function (isRemoval) {
    var __listeners = this.__listeners;
    var __handlers = this.__handlers;
    var targets = this.targets;
    var container = targets.container;
    var content = targets.content;

    // remove handlers

    __handlers.forEach(function (_ref) {
        var evt = _ref.evt;
        var elem = _ref.elem;
        var fn = _ref.fn;

        elem.removeEventListener(evt, fn);
    });

    __handlers.length = __listeners.length = 0;

    // stop render
    this.stop();
    cancelAnimationFrame(this.__timerID.render);

    // remove form sbList
    _shared.sbList.delete(container);

    if (isRemoval) return;

    // restore DOM
    this.scrollTo(0, 0, 300, function () {
        // check if element has been removed from DOM
        if (!container.parentNode) {
            return;
        }

        // reset scroll position
        (0, _utils.setStyle)(container, {
            overflow: ''
        });

        container.scrollTop = container.scrollLeft = 0;

        // reset content
        var childNodes = [].concat((0, _toConsumableArray3.default)(content.childNodes));

        container.innerHTML = '';

        childNodes.forEach(function (el) {
            return container.appendChild(el);
        });
    });
}; /**
    * @module
    * @prototype {Function} destroy
    */