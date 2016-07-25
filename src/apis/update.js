/**
 * @module
 * @prototype {Function} update
 */

import { setStyle } from '../utils/';
import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @this-binding
 *
 * Update canvas size
 */
function updateCanvas() {
    if (this.options.overscrollEffect !== 'glow') return;

    const { targets, size } = this;
    const { elem, context } = targets.canvas;
    const DPR = window.devicePixelRatio || 1;

    elem.width = size.container.width * DPR;
    elem.height = size.container.height * DPR;

    context.scale(DPR, DPR);
};

/**
 * @this-binding
 *
 * Update scrollbar track and thumb
 */
function updateTrack() {
    const {
        size,
        thumbSize,
        targets: { xAxis, yAxis },
    } = this;

    // hide scrollbar if content size less than container
    setStyle(xAxis.track, {
        'display': size.content.width <= size.container.width ? 'none' : 'block',
    });
    setStyle(yAxis.track, {
        'display': size.content.height <= size.container.height ? 'none' : 'block',
    });

    // use percentage value for thumb
    setStyle(xAxis.thumb, {
        'width': `${thumbSize.x}px`,
    });
    setStyle(yAxis.thumb, {
        'height': `${thumbSize.y}px`,
    });
}

/**
 * @this-binding
 *
 * Re-calculate sizes:
 *     1. offset limit
 *     2. thumb sizes
 */
function update() {
    const {
        limit,
        options,
    } = this;

    this.__updateBounding();

    const size = this.getSize();
    const newLimit = {
        x: Math.max(size.content.width - size.container.width, 0),
        y: Math.max(size.content.height - size.container.height, 0),
    };

    this.__readonly('size', size);

    if (newLimit.x === limit.x &&
        newLimit.y === limit.y) {
        return this::updateCanvas();
    }

    const thumbSize = {
        // real thumb sizes
        realX: size.container.width / size.content.width * size.container.width,
        realY: size.container.height / size.content.height * size.container.height,
    };

    // rendered thumb sizes
    thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
    thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);

    this.__readonly('limit', newLimit)
        .__readonly('thumbSize', thumbSize);

    // update appearance
    this::updateTrack();
    this::updateCanvas();

    // re-positioning
    this.setPosition();
    this.__setThumbPosition();
};

/**
 * @method
 * @api
 * Update scrollbars appearance
 *
 * @param {Boolean} inAsync: update asynchronous
 */
SmoothScrollbar.prototype.update = function (inAsync) {
    if (inAsync) {
        requestAnimationFrame(this::update);
    } else {
        this::update();
    }
};
