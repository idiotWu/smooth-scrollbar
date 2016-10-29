'use strict';

var _freeze = require('babel-runtime/core-js/object/freeze');

var _freeze2 = _interopRequireDefault(_freeze);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.initTargets = initTargets;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

/**
 * Initialize targets map
 * @private
 * @param {element} container - Scrollbar container element
 */
function initTargets(container) {
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

    _utils.setPrivateProp.call(this, 'targets', (0, _freeze2.default)({
        container: container, content: content,
        canvas: {
            elem: canvas,
            context: canvas.getContext('2d')
        },
        xAxis: (0, _freeze2.default)({
            track: trackX,
            thumb: (0, _helpers.findChild)(trackX, 'scrollbar-thumb-x')
        }),
        yAxis: (0, _freeze2.default)({
            track: trackY,
            thumb: (0, _helpers.findChild)(trackY, 'scrollbar-thumb-y')
        })
    }));
};