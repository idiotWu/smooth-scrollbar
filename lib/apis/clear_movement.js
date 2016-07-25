'use strict';

var _smooth_scrollbar = require('../smooth_scrollbar');

/**
 * @method
 * @api
 * Stop scrollbar right away
 */
_smooth_scrollbar.SmoothScrollbar.prototype.clearMovement = _smooth_scrollbar.SmoothScrollbar.prototype.stop = function () {
  this.movement.x = this.movement.y = 0;
  cancelAnimationFrame(this.__timerID.scrollTo);
}; /**
    * @module
    * @prototype {Function} clearMovement|stop
    */