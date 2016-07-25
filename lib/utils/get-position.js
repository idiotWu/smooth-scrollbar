'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPosition = undefined;

var _getPointerData = require('./get-pointer-data');

/**
 * Get pointer/finger position
 * @param {Object} evt: event object
 *
 * @return {Object}: position{x, y}
 */
var getPosition = exports.getPosition = function getPosition(evt) {
  var data = (0, _getPointerData.getPointerData)(evt);

  return {
    x: data.clientX,
    y: data.clientY
  };
}; /**
    * @module
    * @export {Function} getPosition
    */