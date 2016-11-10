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
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.offset.x;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.offset.y;
    var withoutCallbacks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    this.__hideTrackThrottle();

    var status = {};
    var options = this.options,
        offset = this.offset,
        limit = this.limit,
        targets = this.targets,
        __listeners = this.__listeners;


    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    if (Math.abs(x - offset.x) > 1) this.showTrack('x');
    if (Math.abs(y - offset.y) > 1) this.showTrack('y');

    x = (0, _utils.pickInRange)(x, 0, limit.x);
    y = (0, _utils.pickInRange)(y, 0, limit.y);

    if (x === offset.x && y === offset.y) return;

    status.direction = {
        x: x === offset.x ? 'none' : x > offset.x ? 'right' : 'left',
        y: y === offset.y ? 'none' : y > offset.y ? 'down' : 'up'
    };

    this.__readonly('offset', { x: x, y: y });

    status.limit = _extends({}, limit);
    status.offset = _extends({}, this.offset);

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