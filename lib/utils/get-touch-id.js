'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTouchID = undefined;

var _getPointerData = require('./get-pointer-data');

/**
 * Get touch identifier
 *
 * @param {Object} evt: event object
 *
 * @return {Number}: touch id
 */
var getTouchID = exports.getTouchID = function getTouchID(evt) {
  var data = (0, _getPointerData.getPointerData)(evt);

  return data.identifier;
}; /**
    * @module
    * @export {Function} getTouchID
    */