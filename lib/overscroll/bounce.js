'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.overscrollBounce = overscrollBounce;

var _utils = require('../utils/');

function overscrollBounce(x, y) {
    var size = this.size,
        offset = this.offset,
        targets = this.targets,
        thumbOffset = this.thumbOffset;
    var xAxis = targets.xAxis,
        yAxis = targets.yAxis,
        content = targets.content;


    (0, _utils.setStyle)(content, {
        '-transform': 'translate3d(' + -(offset.x + x) + 'px, ' + -(offset.y + y) + 'px, 0)'
    });

    if (x) {
        var ratio = size.container.width / (size.container.width + Math.abs(x));

        (0, _utils.setStyle)(xAxis.thumb, {
            '-transform': 'translate3d(' + thumbOffset.x + 'px, 0, 0) scale3d(' + ratio + ', 1, 1)',
            '-transform-origin': x < 0 ? 'left' : 'right'
        });
    }

    if (y) {
        var _ratio = size.container.height / (size.container.height + Math.abs(y));

        (0, _utils.setStyle)(yAxis.thumb, {
            '-transform': 'translate3d(0, ' + thumbOffset.y + 'px, 0) scale3d(1, ' + _ratio + ', 1)',
            '-transform-origin': y < 0 ? 'top' : 'bottom'
        });
    }
} /**
   * @module
   * @this-bind
   * @export {Function} overscrollBounce
   */