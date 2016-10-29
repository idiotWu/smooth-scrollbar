'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleWheelEvents = handleWheelEvents;

var _helpers = require('../../helpers/');

var _contants = require('../../contants/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _overscroll = require('../overscroll/');

var _render = require('../render/');

/**
 * Wheel events handler
 * @private
 */
function handleWheelEvents() {
    var _this = this;

    var _ref = _utils.getPrivateProp.call(this, 'targets');

    var container = _ref.container;


    var wheelLocked = false;

    // since we can't detect whether user release touchpad
    // handle it with debounce is the best solution now, as a trade-off
    var releaseWheel = (0, _helpers.debounce)(function () {
        wheelLocked = false;
    }, 30, false);

    _dom.addEvent.call(this, container, _contants.GLOBAL_ENV.WHEEL_EVENT, function (evt) {
        var _ref2 = _utils.getPrivateProp.call(_this);

        var options = _ref2.options;

        var _getDelta = (0, _helpers.getDelta)(evt);

        var x = _getDelta.x;
        var y = _getDelta.y;


        x *= options.speed;
        y *= options.speed;

        if (_render.shouldPropagateMovement.call(_this, x, y)) {
            return _utils.callPrivateMethod.call(_this, 'updateThrottle');
        }

        evt.preventDefault();
        releaseWheel();

        if (_this.overscrollBack) {
            wheelLocked = true;
        }

        if (wheelLocked) {
            if (_overscroll.willOverscroll.call(_this, 'x', x)) x = 0;
            if (_overscroll.willOverscroll.call(_this, 'y', y)) y = 0;
        }

        _render.addMovement.call(_this, x, y, true);
    });
};