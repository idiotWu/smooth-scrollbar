'use strict';

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @internal
 * Set thumb position in track
 */
/**
 * @module
 * @prototype {Function} __setThumbPosition
 */

function __setThumbPosition() {
    var targets = this.targets;
    var size = this.size;
    var offset = this.offset;
    var thumbOffset = this.thumbOffset;
    var thumbSize = this.thumbSize;


    thumbOffset.x = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));

    thumbOffset.y = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

    (0, _utils.setStyle)(targets.xAxis.thumb, {
        '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0)'
    });

    (0, _utils.setStyle)(targets.yAxis.thumb, {
        '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0)'
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__setThumbPosition', {
    value: __setThumbPosition,
    writable: true,
    configurable: true
});