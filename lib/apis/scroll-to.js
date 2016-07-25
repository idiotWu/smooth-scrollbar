'use strict';

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Scrolling scrollbar to position with transition
 *
 * @param {Number} [x]: scrollbar position in x axis
 * @param {Number} [y]: scrollbar position in y axis
 * @param {Number} [duration]: transition duration
 * @param {Function} [cb]: callback
 */
/**
 * @module
 * @prototype {Function} scrollTo
 */

_smoothScrollbar.SmoothScrollbar.prototype.scrollTo = function () {
    var x = arguments.length <= 0 || arguments[0] === undefined ? this.offset.x : arguments[0];
    var y = arguments.length <= 1 || arguments[1] === undefined ? this.offset.y : arguments[1];

    var _this = this;

    var duration = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var cb = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var options = this.options;
    var offset = this.offset;
    var limit = this.limit;
    var __timerID = this.__timerID;


    cancelAnimationFrame(__timerID.scrollTo);
    cb = typeof cb === 'function' ? cb : function () {};

    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    var startX = offset.x;
    var startY = offset.y;

    var disX = (0, _utils.pickInRange)(x, 0, limit.x) - startX;
    var disY = (0, _utils.pickInRange)(y, 0, limit.y) - startY;

    var curveX = (0, _utils.buildCurve)(disX, duration);
    var curveY = (0, _utils.buildCurve)(disY, duration);

    var totalFrame = curveX.length;
    var frame = 0;

    var scroll = function scroll() {
        if (frame === totalFrame) {
            _this.setPosition(x, y);

            return requestAnimationFrame(function () {
                cb(_this);
            });
        }

        _this.setPosition(startX + curveX[frame], startY + curveY[frame]);

        frame++;

        __timerID.scrollTo = requestAnimationFrame(scroll);
    };

    scroll();
};