/**
 * @module
 * @prototype {Function} getSize
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @api
 * Get container and content size
 *
 * @return {Object}: an object contains container and content's width and height
 */
SmoothScrollbar.prototype.getSize = function () {
    const container = this.targets.container;
    const content = this.targets.content;

    return {
        container: {
            // requires `overflow: hidden`
            width: container.clientWidth,
            height: container.clientHeight,
        },
        content: {
            // border width should be included
            width: content.offsetWidth - content.clientWidth + content.scrollWidth,
            height: content.offsetHeight - content.clientHeight + content.scrollHeight,
        },
    };
};
