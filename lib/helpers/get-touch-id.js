'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTouchID = getTouchID;

var _getPointerData = require('./get-pointer-data');

/**
 * Get touch identifier
 * @param {object} evt - Event object
 * @return {number}: touch id
 */
function getTouchID(evt) {
  var data = (0, _getPointerData.getPointerData)(evt);

  return data.identifier;
};