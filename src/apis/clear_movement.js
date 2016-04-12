/**
 * @module
 * @prototype {Function} clearMovement|stop
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Stop scrollbar right away
 */
SmoothScrollbar.prototype.clearMovement = SmoothScrollbar.prototype.stop = function() {
    this.movement.x = this.movement.y = 0;
};