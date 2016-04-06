/**
 * @module
 * @prototype {Function} setOptions
 */

import { pickInRange } from '../utils/';
import { OPTION_LIMIT } from '../shared/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Set scrollbar options
 *
 * @param {Object} options
 */
SmoothScrollbar.prototype.setOptions = function(options = {}) {
    Object.assign(this.options, options);
};