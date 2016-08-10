/**
 * @module
 * @prototype {Function} setOptions
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @api
 * Set scrollbar options
 *
 * @param {Object} options
 */
SmoothScrollbar.prototype.setOptions = function (options = {}) {
    Object.keys(options).forEach((prop) => {
        if (!this.options.hasOwnProperty(prop) || options[prop] === undefined) return;

        this.options[prop] = options[prop];
    });
};
