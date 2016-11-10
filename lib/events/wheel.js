'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

var _shared = require('../shared/');

/**
 * @method
 * @internal
 * Wheel event handler builder
 */
function __wheelHandler() {
    var _this = this;

    var container = this.targets.container;


    var wheelLocked = false;

    // since we can't detect whether user release touchpad
    // handle it with debounce is the best solution now, as a trade-off
    var releaseWheel = (0, _utils.debounce)(function () {
        wheelLocked = false;
    }, 30, false);

    this.__addEvent(container, _shared.GLOBAL_ENV.WHEEL_EVENT, function (evt) {
        var options = _this.options;

        var _getDelta = (0, _utils.getDelta)(evt),
            x = _getDelta.x,
            y = _getDelta.y;

        x *= options.speed;
        y *= options.speed;

        if (_this.__shouldPropagateMovement(x, y)) {
            return _this.__updateThrottle();
        }

        evt.preventDefault();
        releaseWheel();

        if (_this.overscrollBack) {
            wheelLocked = true;
        }

        if (wheelLocked) {
            if (_this.__willOverscroll('x', x)) x = 0;
            if (_this.__willOverscroll('y', y)) y = 0;
        }

        _this.__addMovement(x, y, true);
    });
} /**
   * @module
   * @prototype {Function} __wheelHandler
   */

;

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__wheelHandler', {
    value: __wheelHandler,
    writable: true,
    configurable: true
});