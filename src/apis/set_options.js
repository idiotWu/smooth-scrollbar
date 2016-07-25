/**
 * @module
 * @prototype {Function} setOptions
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

/**
 * @method
 * @api
 * Set scrollbar options
 *
 * @param {Object} options
 */
SmoothScrollbar.prototype.setOptions = function(options = {}) {
    const res = {};

    Object.keys(options).forEach((prop) => {
        if (!this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

        res[prop] = options[prop];
    });

    Object.assign(this.options, res);
};
