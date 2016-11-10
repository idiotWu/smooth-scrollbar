'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Create infinite scroll listener
 *
 * @param {Function} cb: infinite scroll action
 * @param {Number} [threshold]: infinite scroll threshold(to bottom), default is 50(px)
 */
_smoothScrollbar.SmoothScrollbar.prototype.infiniteScroll = function (cb) {
    var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

    if (typeof cb !== 'function') return;

    var lastOffset = {
        x: 0,
        y: 0
    };

    var entered = false;

    this.addListener(function (status) {
        var offset = status.offset,
            limit = status.limit;


        if (limit.y - offset.y <= threshold && offset.y > lastOffset.y && !entered) {
            entered = true;
            setTimeout(function () {
                return cb(status);
            });
        }

        if (limit.y - offset.y > threshold) {
            entered = false;
        }

        lastOffset = offset;
    });
}; /**
    * @module
    * @prototype {Function} infiniteScroll
    */