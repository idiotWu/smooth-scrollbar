"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPointerData = getPointerData;
/**
 * Get pointer/touch data
 * @param {object} evt - Event object
 * @return {object}
 */
function getPointerData(evt) {
  // if is touch event, return last item in touchList
  // else return original event
  return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
};