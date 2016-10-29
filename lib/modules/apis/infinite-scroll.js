'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.infiniteScroll = infiniteScroll;

var _listener = require('./listener');

/**
 * Create infinite scroll listener
 * @public
 * @param {function} cb - infinite scroll action
 * @param {number} [threshold=50] - infinite scroll threshold(to bottom), default is 50(px)
 */
function infiniteScroll(cb) {
    var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

    if (typeof cb !== 'function') return;

    var lastOffset = {
        x: 0,
        y: 0
    };

    var entered = false;

    _listener.addListener.call(this, function (status) {
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
};