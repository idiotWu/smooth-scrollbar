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
    let res = {};

    Object.keys(options).forEach((prop) => {
        if (!this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

        res[prop] = options[prop];
    });

    Object.assign(this.options, res);
};