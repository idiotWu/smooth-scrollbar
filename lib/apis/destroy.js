'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils');

var _shared = require('../shared');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
                                                                                                                                                                                                              * @module
                                                                                                                                                                                                              * @prototype {Function} destroy
                                                                                                                                                                                                              */

/**
 * @method
 * @api
 * Remove all scrollbar listeners and event handlers
 *
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
_smoothScrollbar.SmoothScrollbar.prototype.destroy = function (isRemoval) {
    var __listeners = this.__listeners,
        __handlers = this.__handlers,
        __observer = this.__observer,
        targets = this.targets;
    var container = targets.container,
        content = targets.content;

    // remove handlers

    __handlers.forEach(function (_ref) {
        var evt = _ref.evt,
            elem = _ref.elem,
            fn = _ref.fn;

        elem.removeEventListener(evt, fn);
    });

    __handlers.length = __listeners.length = 0;

    // stop render
    this.stop();
    cancelAnimationFrame(this.__timerID.render);

    // stop observe
    if (__observer) {
        __observer.disconnect();
    }

    // remove form sbList
    _shared.sbList.delete(container);

    // check if element has been removed from DOM
    if (isRemoval || !container.parentNode) {
        return;
    }

    // reset content
    var childNodes = [].concat(_toConsumableArray(content.childNodes));

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    childNodes.forEach(function (el) {
        return container.appendChild(el);
    });

    // reset scroll position
    (0, _utils.setStyle)(container, {
        overflow: ''
    });

    container.scrollTop = this.scrollTop;
    container.scrollLeft = this.scrollLeft;
};