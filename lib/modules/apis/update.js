'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = update;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _getSize = require('./get-size');

var _setPosition = require('./set-position');

/**
 * Update scrollbars appearance
 * @public
 * @param {Boolean} inAsync: update asynchronous
 */
function update(inAsync) {
    if (inAsync) {
        requestAnimationFrame(renew.bind(this));
    } else {
        renew.call(this);
    }
};

/**
 * Update canvas size
 */
function updateCanvas() {
    var _ref = _utils.getPrivateProp.call(this);

    var options = _ref.options;
    var targets = _ref.targets;
    var size = _ref.size;


    if (options.overscrollEffect !== 'glow') return;

    var _targets$canvas = targets.canvas;
    var elem = _targets$canvas.elem;
    var context = _targets$canvas.context;


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
    var _ref2 = _utils.getPrivateProp.call(this);

    var size = _ref2.size;
    var thumbSize = _ref2.thumbSize;
    var targets = _ref2.targets;
    var xAxis = targets.xAxis;
    var yAxis = targets.yAxis;

    // hide scrollbar if content size less than container

    (0, _helpers.setStyle)(xAxis.track, {
        'display': size.content.width <= size.container.width ? 'none' : 'block'
    });
    (0, _helpers.setStyle)(yAxis.track, {
        'display': size.content.height <= size.container.height ? 'none' : 'block'
    });

    // use percentage value for thumb
    (0, _helpers.setStyle)(xAxis.thumb, {
        'width': thumbSize.x + 'px'
    });
    (0, _helpers.setStyle)(yAxis.thumb, {
        'height': thumbSize.y + 'px'
    });
}

/**
 * Re-calculate sizes:
 *     1. offset limit
 *     2. thumb sizes
 */
function renew() {
    var _ref3 = _utils.getPrivateProp.call(this);

    var options = _ref3.options;


    _dom.updateBounding.call(this);

    var size = _getSize.getSize.call(this);

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

    _utils.setPrivateProp.call(this, {
        size: size, thumbSize: thumbSize,
        limit: newLimit
    });

    // update appearance
    updateTrack.call(this);
    updateCanvas.call(this);

    // re-positioning
    _setPosition.setPosition.call(this);
    _dom.updateThumbPosition.call(this);
};