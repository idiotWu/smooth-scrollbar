'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.overscrollGlow = overscrollGlow;

var _utils = require('../utils/');

var GLOW_MAX_OPACITY = 0.75; /**
                              * @module
                              * @this-bind
                              * @export {Function} overscrollGlow
                              */

var GLOW_MAX_OFFSET = 0.25;

function overscrollGlow(x, y) {
    var size = this.size,
        targets = this.targets,
        options = this.options;
    var _targets$canvas = targets.canvas,
        canvas = _targets$canvas.elem,
        ctx = _targets$canvas.context;


    if (!x && !y) {
        return (0, _utils.setStyle)(canvas, {
            display: 'none'
        });
    }

    (0, _utils.setStyle)(canvas, {
        display: 'block'
    });

    ctx.clearRect(0, 0, size.content.width, size.container.height);
    ctx.fillStyle = options.overscrollEffectColor;
    renderGlowX.call(this, x);
    renderGlowY.call(this, y);
}

function renderGlowX(strength) {
    var size = this.size,
        targets = this.targets,
        __touchRecord = this.__touchRecord,
        MAX_OVERSCROLL = this.MAX_OVERSCROLL;
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

    var opacity = (0, _utils.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    var startOffset = (0, _utils.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    var x = Math.abs(strength);
    var y = __touchRecord.getLastPosition('y') || height / 2;

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -startOffset);
    ctx.quadraticCurveTo(x, y, 0, height + startOffset);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function renderGlowY(strength) {
    var size = this.size,
        targets = this.targets,
        __touchRecord = this.__touchRecord,
        MAX_OVERSCROLL = this.MAX_OVERSCROLL;
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

    var opacity = (0, _utils.pickInRange)(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    var startOffset = (0, _utils.pickInRange)(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    var x = __touchRecord.getLastPosition('x') || width / 2;
    var y = Math.abs(strength);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-startOffset, 0);
    ctx.quadraticCurveTo(x, y, width + startOffset, 0);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}