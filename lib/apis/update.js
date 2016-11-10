'use strict';

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @this-binding
 *
 * Update canvas size
 */
/**
 * @module
 * @prototype {Function} update
 */

function updateCanvas() {
    if (this.options.overscrollEffect !== 'glow') return;

    var targets = this.targets,
        size = this.size;
    var _targets$canvas = targets.canvas,
        elem = _targets$canvas.elem,
        context = _targets$canvas.context;

    var DPR = window.devicePixelRatio || 1;

    var nextWidth = size.container.width * DPR;
    var nextHeight = size.container.height * DPR;

    if (nextWidth === elem.width && nextHeight === elem.height) {
        return;
    }

    elem.width = nextWidth;
    elem.height = nextHeight;

    context.scale(DPR, DPR);
};

/**
 * @this-binding
 *
 * Update scrollbar track and thumb
 */
function updateTrack() {
    var size = this.size,
        thumbSize = this.thumbSize,
        _targets = this.targets,
        xAxis = _targets.xAxis,
        yAxis = _targets.yAxis;

    // hide scrollbar if content size less than container

    (0, _utils.setStyle)(xAxis.track, {
        'display': size.content.width <= size.container.width ? 'none' : 'block'
    });
    (0, _utils.setStyle)(yAxis.track, {
        'display': size.content.height <= size.container.height ? 'none' : 'block'
    });

    // use percentage value for thumb
    (0, _utils.setStyle)(xAxis.thumb, {
        'width': thumbSize.x + 'px'
    });
    (0, _utils.setStyle)(yAxis.thumb, {
        'height': thumbSize.y + 'px'
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
    var options = this.options;


    this.__updateBounding();

    var size = this.getSize();
    var newLimit = {
        x: Math.max(size.content.width - size.container.width, 0),
        y: Math.max(size.content.height - size.container.height, 0)
    };

    var thumbSize = {
        // real thumb sizes
        realX: size.container.width / size.content.width * size.container.width,
        realY: size.container.height / size.content.height * size.container.height
    };

    // rendered thumb sizes
    thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
    thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);

    this.__readonly('size', size).__readonly('limit', newLimit).__readonly('thumbSize', thumbSize);

    // update appearance
    updateTrack.call(this);
    updateCanvas.call(this);

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
_smoothScrollbar.SmoothScrollbar.prototype.update = function (inAsync) {
    if (inAsync) {
        requestAnimationFrame(update.bind(this));
    } else {
        update.call(this);
    }
};