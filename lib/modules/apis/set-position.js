'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.setPosition = setPosition;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _toggleTrack = require('./toggle-track');

/**
 * Set scrollbar position without transition
 * @public
 * @param {number} [x] - scrollbar position in x axis
 * @param {number} [y] - scrollbar position in y axis
 * @param {boolean} [withoutCallbacks] - disable callback functions temporarily
 */
function setPosition() {
    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.offset.x;
    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.offset.y;
    var withoutCallbacks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    _utils.callPrivateMethod.call(this, 'hideTrackDebounce');

    var status = {};

    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        offset = _ref.offset,
        limit = _ref.limit,
        targets = _ref.targets,
        scrollListeners = _ref.scrollListeners;

    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    if (Math.abs(x - offset.x) > 1) _toggleTrack.showTrack.call(this, 'x');
    if (Math.abs(y - offset.y) > 1) _toggleTrack.showTrack.call(this, 'y');

    x = (0, _helpers.pickInRange)(x, 0, limit.x);
    y = (0, _helpers.pickInRange)(y, 0, limit.y);

    if (x === offset.x && y === offset.y) return;

    status.direction = {
        x: x === offset.x ? 'none' : x > offset.x ? 'right' : 'left',
        y: y === offset.y ? 'none' : y > offset.y ? 'down' : 'up'
    };

    _utils.setPrivateProp.call(this, 'offset', { x: x, y: y });

    status.offset = { x: x, y: y };
    status.limit = _extends({}, limit);

    // update thumb position after offset update
    _dom.updateThumbPosition.call(this);

    (0, _helpers.setStyle)(targets.content, {
        '-transform': 'translate3d(' + -x + 'px, ' + -y + 'px, 0)'
    });

    // invoke all listeners
    if (withoutCallbacks) return;

    scrollListeners.forEach(function (fn) {
        if (options.syncCallbacks) {
            fn(status);
        } else {
            requestAnimationFrame(function () {
                fn(status);
            });
        }
    });
};