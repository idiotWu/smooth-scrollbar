/**
 * @module
 * @prototype {Function} getContentElem
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Get scroll content element
 */
SmoothScrollbar.prototype.getContentElem = function() {
    return this.targets.content;
};