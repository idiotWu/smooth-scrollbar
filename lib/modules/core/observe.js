'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.observe = observe;

var _contants = require('../../contants/');

var _utils = require('../utils/');

var _apis = require('../apis/');

/**
 * Initialize mutation observer
 * @private
 */
function observe() {
    var _this = this;

    if (typeof _contants.GLOBAL_ENV.MutationObserver !== 'function') {
        return;
    }

    var _ref = _utils.getPrivateProp.call(this, 'targets'),
        content = _ref.content;

    // observe


    var observer = new _contants.GLOBAL_ENV.MutationObserver(function () {
        _apis.update.call(_this, true);
    });

    observer.observe(content, {
        childList: true
    });

    _utils.setPrivateProp.call(this, 'observer', observer);
};