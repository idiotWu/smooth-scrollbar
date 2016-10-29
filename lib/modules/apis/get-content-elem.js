'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getContentElem = getContentElem;

var _utils = require('../utils/');

/**
 * Get scroll content element
 * @public
 */
function getContentElem() {
    return _utils.getPrivateProp.call(this, 'targets').content;
};