'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                      * @prototype {Function} __renderOverscroll
                                                                                                                                                                                                                                                                      */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

var _overscroll = require('../overscroll/');

var _shared = require('../shared/');

var _utils = require('../utils/');

// @this-binding
function calcNext() {
    var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (!dir) return;

    var options = this.options,
        movement = this.movement,
        overscrollRendered = this.overscrollRendered,
        MAX_OVERSCROLL = this.MAX_OVERSCROLL;


    var dest = movement[dir] = (0, _utils.pickInRange)(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);
    var damping = options.overscrollDamping;

    var next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) * damping;

    if (options.renderByPixels) {
        next |= 0;
    }

    if (!this.__isMovementLocked() && Math.abs(next - overscrollRendered[dir]) < 0.1) {
        next -= dest / Math.abs(dest || 1);
    }

    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
        this.__readonly('overscrollBack', true);
    }

    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
        next = 0;
        this.__readonly('overscrollBack', false);
    }

    overscrollRendered[dir] = next;
}

// @this-bind
function shouldUpdate(lastRendered) {
    var __touchRecord = this.__touchRecord,
        overscrollRendered = this.overscrollRendered;

    // has unrendered pixels?

    if (overscrollRendered.x !== lastRendered.x || overscrollRendered.y !== lastRendered.y) return true;

    // is touch position updated?
    if (_shared.GLOBAL_ENV.TOUCH_SUPPORTED && __touchRecord.updatedRecently()) return true;

    return false;
}

// @this-binding
function __renderOverscroll() {
    var _this = this;

    var dirs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (!dirs.length || !this.options.overscrollEffect) return;

    var options = this.options,
        overscrollRendered = this.overscrollRendered;


    var lastRendered = _extends({}, overscrollRendered);

    dirs.forEach(function (dir) {
        return calcNext.call(_this, dir);
    });

    if (!shouldUpdate.call(this, lastRendered)) return;

    // x,y is same direction as it's in `setPosition(x, y)`
    switch (options.overscrollEffect) {
        case 'bounce':
            return _overscroll.overscrollBounce.call(this, overscrollRendered.x, overscrollRendered.y);
        case 'glow':
            return _overscroll.overscrollGlow.call(this, overscrollRendered.x, overscrollRendered.y);
        default:
            return;
    }
}

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__renderOverscroll', {
    value: __renderOverscroll,
    writable: true,
    configurable: true
});