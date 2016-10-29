'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateThumbPosition = updateThumbPosition;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

/**
 * Update thumb position
 */
function updateThumbPosition() {
    var _ref = _utils.getPrivateProp.call(this);

    var targets = _ref.targets;
    var size = _ref.size;
    var offset = _ref.offset;
    var thumbOffset = _ref.thumbOffset;
    var thumbSize = _ref.thumbSize;


    thumbOffset.x = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));

    thumbOffset.y = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

    (0, _helpers.setStyle)(targets.xAxis.thumb, {
        '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0)'
    });

    (0, _helpers.setStyle)(targets.yAxis.thumb, {
        '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0)'
    });
};