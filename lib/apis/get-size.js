'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Get container and content size
 *
 * @return {Object}: an object contains container and content's width and height
 */
_smoothScrollbar.SmoothScrollbar.prototype.getSize = function () {
    var container = this.targets.container;
    var content = this.targets.content;

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
}; /**
    * @module
    * @prototype {Function} getSize
    */