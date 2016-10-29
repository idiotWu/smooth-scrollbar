import {
    setStyle,
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../utils/';

const GLOW_MAX_OPACITY = 0.75;
const GLOW_MAX_OFFSET = 0.25;

/**
 * Render 'glow' overscrolling effect
 * @param {number} x
 * @param {number} y
 */
export function overscrollGlow(x, y) {
    const {
        size,
        targets,
        options,
    } = this::getPrivateProp();

    const { elem: canvas, context: ctx } = targets.canvas;

    if (!x && !y) {
        return setStyle(canvas, {
            display: 'none',
        });
    }

    setStyle(canvas, {
        display: 'block',
    });

    ctx.clearRect(0, 0, size.content.width, size.container.height);
    ctx.fillStyle = options.overscrollEffectColor;
    this::_renderGlowX(x);
    this::_renderGlowY(y);
}

function _renderGlowX(strength) {
    const {
        size,
        targets,
        touchRecord,
        MAX_OVERSCROLL,
    } = this::getPrivateProp();

    const { width, height } = size.container;
    const { context: ctx } = targets.canvas;

    ctx.save();

    if (strength > 0) {
        // glow on right side
        // horizontally flip
        ctx.transform(-1, 0, 0, 1, width, 0);
    }

    const opacity = pickInRange(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    const startOffset = pickInRange(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    const x = Math.abs(strength);
    const y = touchRecord.getLastPosition('y') || (height / 2);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(0, -startOffset);
    ctx.quadraticCurveTo(x, y, 0, height + startOffset);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function _renderGlowY(strength) {
    const {
        size,
        targets,
        touchRecord,
        MAX_OVERSCROLL,
    } = this::getPrivateProp();

    const { width, height } = size.container;
    const { context: ctx } = targets.canvas;

    ctx.save();

    if (strength > 0) {
        // glow on bottom side
        // vertically flip
        ctx.transform(1, 0, 0, -1, 0, height);
    }

    const opacity = pickInRange(Math.abs(strength) / MAX_OVERSCROLL, 0, GLOW_MAX_OPACITY);
    const startOffset = pickInRange(opacity, 0, GLOW_MAX_OFFSET) * width;

    // controll point
    const x = touchRecord.getLastPosition('x') || (width / 2);
    const y = Math.abs(strength);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(-startOffset, 0);
    ctx.quadraticCurveTo(x, y, width + startOffset, 0);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}
