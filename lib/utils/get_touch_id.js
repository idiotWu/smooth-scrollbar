'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTouchID = undefined;

var _get_pointer_data = require('./get_pointer_data');

/**
 * Get touch identifier
 *
 * @param {Object} evt: event object
 *
 * @return {Number}: touch id
 */
var getTouchID = exports.getTouchID = function getTouchID(evt) {
  var data = (0, _get_pointer_data.getPointerData)(evt);

  return data.identifier;
}; /**
    * @module
    * @export {Function} getTouchID
    */