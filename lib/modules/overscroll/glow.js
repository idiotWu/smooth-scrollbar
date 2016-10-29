'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.overscrollGlow = overscrollGlow;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var GLOW_MAX_OPACITY = 0.75;
var GLOW_MAX_OFFSET = 0.25;

/**
 * Render 'glow' overscrolling effect
 * @param {number} x
 * @param {number} y
 */
function overscrollGlow(x, y) {
    var _ref = _utils.getPrivateProp.call(this),
        size = _ref.size,
        targets = _ref.targets,
        options = _ref.options;

    var _targets$canvas = targets.canvas,
        canvas = _targets$canvas.elem,
        ctx = _targets$canvas.context;


    if (!x && !y) {
        return (0, _helpers.setStyle)(canvas, {
            display: 'none'
        });
    }

    (0, _helpers.setStyle)(canvas, {
        display: 'block'
    });

    ctx.clearRect(0, 0, size.content.width, size.container.height);
    ctx.fillStyle = options.overscrollEffectColor;
    _renderGlowX.call(this, x);
    _renderGlowY.call(this, y);
}

function _renderGlowX(strength) {
    var _ref2 = _utils.getPrivateProp.call(this),
        size = _ref2.size,
        targets = _ref2.targets,
        touchRecord = _ref2.touchRecord,
        MAX_OVERSCROLL = _ref2.MAX_OVERSCROLL;

    var _size$container = size.container,
        width = _size$container.width,
        height = _size$container.height;
    var ctx = targets.canvas.context;


    ctx.save();

    if (strength > 0) {
        // glow on right side
        // horizontally flip
        ctx.transform(-1, 0, 0, 1, width, 0);
    }

    var opacity = (0, _helpers.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    var startOffset = (0, _helpers.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    var x = Math.abs(strength);
    var y = touchRecord.getLastPosition('y') || height / 2;

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -startOffset);
    ctx.quadraticCurveTo(x, y, 0, height + startOffset);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function _renderGlowY(strength) {
    var _ref3 = _utils.getPrivateProp.call(this),
        size = _ref3.size,
        targets = _ref3.targets,
        touchRecord = _ref3.touchRecord,
        MAX_OVERSCROLL = _ref3.MAX_OVERSCROLL;

    var _size$container2 = size.container,
        width = _size$container2.width,
        height = _size$container2.height;
    var ctx = targets.canvas.context;


    ctx.save();

    if (strength > 0) {
        // glow on bottom side
        // vertically flip
        ctx.transform(1, 0, 0, -1, 0, height);
    }

    var opacity = (0, _helpers.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    var startOffset = (0, _helpers.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    var x = touchRecord.getLastPosition('x') || width / 2;
    var y = Math.abs(strength);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-startOffset, 0);
    ctx.quadraticCurveTo(x, y, width + startOffset, 0);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}