'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

/**
 * @method
 * @api
 * Stop scrollbar right away
 */
_smoothScrollbar.SmoothScrollbar.prototype.clearMovement = _smoothScrollbar.SmoothScrollbar.prototype.stop = function () {
  this.movement.x = this.movement.y = 0;
  cancelAnimationFrame(this.__timerID.scrollTo);
}; /**
    * @module
    * @prototype {Function} clearMovement|stop
    */