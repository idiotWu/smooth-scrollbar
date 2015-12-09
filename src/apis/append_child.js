/**
 * @module
 * @prototype {Function} appendChild
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Remove all event listeners
 */
SmoothScrollbar.prototype.appendChild = function(elem) {
    const { __targets } = this;

    __targets.content.appendChild(elem);

    return this;
};