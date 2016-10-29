'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.destroy = destroy;

var _helpers = require('../../helpers/');

var _contants = require('../../contants/');

var _utils = require('../utils/');

var _clearMovement = require('./clear-movement');

var _scrollTo = require('./scroll-to');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

/**
 * Remove all scrollbar listeners and event handlers
 * @public
 * @param {boolean} isRemoval - Whether node is removing from DOM
 */
function destroy(isRemoval) {
    var _ref = _utils.getPrivateProp.call(this),
        scrollListeners = _ref.scrollListeners,
        eventHandlers = _ref.eventHandlers,
        observer = _ref.observer,
        targets = _ref.targets,
        timerID = _ref.timerID;

    var container = targets.container,
        content = targets.content;

    // remove handlers

    eventHandlers.forEach(function (_ref2) {
        var evt = _ref2.evt,
            elem = _ref2.elem,
            fn = _ref2.fn;

        elem.removeEventListener(evt, fn);
    });

    eventHandlers.length = scrollListeners.length = 0;

    // stop render
    _clearMovement.clearMovement.call(this);
    cancelAnimationFrame(timerID.render);

    // stop observe
    if (observer) {
        observer.disconnect();
    }

    // remove form scrollbars list
    _contants.ScbList.delete(container);

    if (isRemoval) return;

    // restore DOM
    _scrollTo.scrollTo.call(this, 0, 0, 300, function () {
        // check if element has been removed from DOM
        if (!container.parentNode) {
            return;
        }

        // reset scroll position
        (0, _helpers.setStyle)(container, {
            overflow: ''
        });

        container.scrollTop = container.scrollLeft = 0;

        // reset content
        var childNodes = [].concat(_toConsumableArray(content.childNodes));

        container.innerHTML = '';

        childNodes.forEach(function (el) {
            return container.appendChild(el);
        });
    });
};