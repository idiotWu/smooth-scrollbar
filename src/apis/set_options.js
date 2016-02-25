/**
 * @module
 * @prototype {Function} setOptions
 */

import { pickInRange } from '../utils/';
import { OPTION_LIMIT } from '../options';
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
    Object.keys(options).forEach((prop) => {
        if (isNaN(parseFloat(options[prop]))) {
            delete options[prop];
            return;
        }

        if (!OPTION_LIMIT.hasOwnProperty(prop)) return;

        options[prop] = pickInRange(options[prop], ...OPTION_LIMIT[prop]);
    });

    Object.assign(this.options, options);
};