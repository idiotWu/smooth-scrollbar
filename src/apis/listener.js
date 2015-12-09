/**
 * @module
 * @prototype {Function} addListener
 *            {Function} removeListener
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Add scrolling listener
 *
 * @param {Function} cb: listener
 */
SmoothScrollbar.prototype.addListener = function(cb) {
    if (typeof cb !== 'function') return;

    this.__listeners.push(cb);
};

/**
 * @method
 * @api
 * Remove specific listener from all listeners
 * @param {type} param: description
 */
SmoothScrollbar.prototype.removeListener = function(cb) {
    if (typeof cb !== 'function') return;

    this.__listeners.some((fn, idx, all) => {
        return fn === cb && all.splice(idx, 1);
    });
};