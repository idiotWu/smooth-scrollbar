'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initTargets = initTargets;

var _contants = require('../../contants/');

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _apis = require('../apis/');

/**
 * Initialize targets map
 * @private
 * @param {element} container - Scrollbar container element
 */
function initTargets(container) {
    var _this = this;

    // make container focusable
    container.setAttribute('tabindex', '1');

    // reset scroll position
    container.scrollTop = container.scrollLeft = 0;

    var content = (0, _helpers.findChild)(container, 'scroll-content');
    var canvas = (0, _helpers.findChild)(container, 'overscroll-glow');
    var trackX = (0, _helpers.findChild)(container, 'scrollbar-track-x');
    var trackY = (0, _helpers.findChild)(container, 'scrollbar-track-y');

    (0, _helpers.setStyle)(container, {
        overflow: 'hidden',
        outline: 'none'
    });

    (0, _helpers.setStyle)(canvas, {
        display: 'none',
        'pointer-events': 'none'
    });

    _utils.setPrivateProp.call(this, 'targets', {
        container: container, content: content,
        canvas: {
            elem: canvas,
            context: canvas.getContext('2d')
        },
        xAxis: {
            track: trackX,
            thumb: (0, _helpers.findChild)(trackX, 'scrollbar-thumb-x')
        },
        yAxis: {
            track: trackY,
            thumb: (0, _helpers.findChild)(trackY, 'scrollbar-thumb-y')
        }
    });

    // observe
    if (typeof _contants.GLOBAL_ENV.MutationObserver !== 'function') {
        return;
    }

    var observer = new _contants.GLOBAL_ENV.MutationObserver(function () {
        _apis.update.call(_this, true);
    });

    observer.observe(content, {
        childList: true
    });

    _utils.setPrivateProp.call(this, 'observer', observer);
};