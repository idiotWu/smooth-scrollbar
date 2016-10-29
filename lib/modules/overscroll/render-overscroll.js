'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.renderOverscroll = renderOverscroll;

var _helpers = require('../../helpers/');

var _contants = require('../../contants/');

var _render = require('../render/');

var _utils = require('../utils/');

var _bounce = require('./bounce');

var _glow = require('./glow');

/**
 * Overscroll rendering
 * @private
 * @param  {string[]} [dirs] - Render direction, values within ['x', 'y']
 */
function renderOverscroll() {
    var _this = this;

    var dirs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var _ref = _utils.getPrivateProp.call(this),
        options = _ref.options,
        overscrollRendered = _ref.overscrollRendered;

    if (!dirs.length || !options.overscrollEffect) return;

    var nextFrame = _extends({}, overscrollRendered);

    dirs.forEach(function (dir) {
        nextFrame[dir] = _calcNextOverflow.call(_this, dir);
    });

    if (!_shouldUpdate.call(this, nextFrame)) return;

    // x,y is same direction as it's in `setPosition(x, y)`
    switch (options.overscrollEffect) {
        case _contants.OVERSCROLL_BOUNCE:
            _bounce.overscrollBounce.call(this, nextFrame.x, nextFrame.y);
            break;
        case _contants.OVERSCROLL_GLOW:
            _glow.overscrollGlow.call(this, nextFrame.x, nextFrame.y);
            break;
        default:
            break;
    }

    _utils.setPrivateProp.call(this, 'overscrollRendered', nextFrame);
};

function _calcNextOverflow() {
    var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (!dir) return;

    var _ref2 = _utils.getPrivateProp.call(this),
        options = _ref2.options,
        movement = _ref2.movement,
        overscrollRendered = _ref2.overscrollRendered,
        MAX_OVERSCROLL = _ref2.MAX_OVERSCROLL;

    var dest = movement[dir] = (0, _helpers.pickInRange)(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);
    var damping = options.overscrollDamping;

    var next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) * damping;

    if (options.renderByPixels) {
        next |= 0;
    }

    if (!_render.isMovementLocked.call(this) && Math.abs(next - overscrollRendered[dir]) < 0.1) {
        next -= dest / Math.abs(dest || 1);
    }

    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
        _utils.setPrivateProp.call(this, 'overscrollBack', true);
    }

    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
        next = 0;
        _utils.setPrivateProp.call(this, 'overscrollBack', false);
    }

    // overscrollRendered[dir] = next;
    return next;
}

function _shouldUpdate(nextFrame) {
    var _ref3 = _utils.getPrivateProp.call(this),
        touchRecord = _ref3.touchRecord,
        overscrollRendered = _ref3.overscrollRendered;

    // has unrendered pixels?


    if (overscrollRendered.x !== nextFrame.x || overscrollRendered.y !== nextFrame.y) return true;

    // is touch position updated?
    if (_contants.GLOBAL_ENV.TOUCH_SUPPORTED && touchRecord.updatedRecently()) return true;

    return false;
}