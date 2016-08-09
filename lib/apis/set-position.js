'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                      * @prototype {Function} setPosition
                                                                                                                                                                                                                                                                      */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Set scrollbar position without transition
 *
 * @param {Number} [x]: scrollbar position in x axis
 * @param {Number} [y]: scrollbar position in y axis
 * @param {Boolean} [withoutCallbacks]: disable callback functions temporarily
 */
_smoothScrollbar.SmoothScrollbar.prototype.setPosition = function () {
    var x = arguments.length <= 0 || arguments[0] === undefined ? this.offset.x : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? this.offset.y : arguments[1];
    var withoutCallbacks = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    this.__updateThrottle();

    var status = {};
    var options = this.options;
    var offset = this.offset;
    var limit = this.limit;
    var targets = this.targets;
    var __listeners = this.__listeners;


    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    if (Math.abs(x - offset.x) > 1) this.showTrack('x');
    if (Math.abs(y - offset.y) > 1) this.showTrack('y');

    x = (0, _utils.pickInRange)(x, 0, limit.x);
    y = (0, _utils.pickInRange)(y, 0, limit.y);

    this.__hideTrackThrottle();

    if (x === offset.x && y === offset.y) return;

    status.direction = {
        x: x === offset.x ? 'none' : x > offset.x ? 'right' : 'left',
        y: y === offset.y ? 'none' : y > offset.y ? 'down' : 'up'
    };

    status.limit = _extends({}, limit);

    offset.x = x;
    offset.y = y;
    status.offset = _extends({}, offset);

    // reset thumb position after offset update
    this.__setThumbPosition();

    (0, _utils.setStyle)(targets.content, {
        '-transform': 'translate3d(' + -x + 'px, ' + -y + 'px, 0)'
    });

    // invoke all listeners
    if (withoutCallbacks) return;

    __listeners.forEach(function (fn) {
        if (options.syncCallbacks) {
            fn(status);
        } else {
            requestAnimationFrame(function () {
                fn(status);
            });
        }
    });
};