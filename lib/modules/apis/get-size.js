'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getSize = getSize;

var _utils = require('../utils/');

/**
 * Get container and content size
 * @public
 * @return {object} - an object contains container and content's width and height
 */
function getSize() {
    var _ref = _utils.getPrivateProp.call(this, 'targets'),
        container = _ref.container,
        content = _ref.content;

    return {
        container: {
            // requires `overflow: hidden`
            width: container.clientWidth,
            height: container.clientHeight
        },
        content: {
            // border width should be included
            width: content.offsetWidth - content.clientWidth + content.scrollWidth,
            height: content.offsetHeight - content.clientHeight + content.scrollHeight
        }
    };
};