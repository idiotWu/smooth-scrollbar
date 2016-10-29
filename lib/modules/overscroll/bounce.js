'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.overscrollBounce = overscrollBounce;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

/**
 * Render 'bounce' overscrolling effect
 * @param {number} x
 * @param {number} y
 */
function overscrollBounce(x, y) {
    var _ref = _utils.getPrivateProp.call(this);

    var size = _ref.size;
    var offset = _ref.offset;
    var targets = _ref.targets;
    var thumbOffset = _ref.thumbOffset;
    var xAxis = targets.xAxis;
    var yAxis = targets.yAxis;
    var content = targets.content;


    (0, _helpers.setStyle)(content, {
        '-transform': 'translate3d(' + -(offset.x + x) + 'px, ' + -(offset.y + y) + 'px, 0)'
    });

    if (x) {
        var ratio = size.container.width / (size.container.width + Math.abs(x));

        (0, _helpers.setStyle)(xAxis.thumb, {
            '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0) scale3d(' + ratio + ', 1, 1)',
            '-transform-origin': x < 0 ? 'left' : 'right'
        });
    }

    if (y) {
        var _ratio = size.container.height / (size.container.height + Math.abs(y));

        (0, _helpers.setStyle)(yAxis.thumb, {
            '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0) scale3d(1, ' + _ratio + ', 1)',
            '-transform-origin': y < 0 ? 'top' : 'bottom'
        });
    }
}