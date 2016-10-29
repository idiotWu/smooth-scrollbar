'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addListener = addListener;
exports.removeListener = removeListener;

var _utils = require('../utils/');

/**
 * Add scrolling listener
 * @public
 * @param {function} cb - Scroll listener
 */
function addListener(cb) {
    if (typeof cb !== 'function') return;

    _utils.getPrivateProp.call(this, 'listeners').push(cb);
};

/**
 * Remove specific listener from all
 * @public
 * @param {function} cb - Scroll listener
 */
function removeListener(cb) {
    if (typeof cb !== 'function') return;

    _utils.getPrivateProp.call(this, 'listeners').some(function (fn, idx, all) {
        return fn === cb && all.splice(idx, 1);
    });
};