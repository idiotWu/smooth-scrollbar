'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPointerPosition = getPointerPosition;

var _getPointerData = require('./get-pointer-data');

/**
 * Get pointer/finger position
 * @param {object} evt - Event object
 * @return {object} - {x, y}
 */
function getPointerPosition(evt) {
    var data = (0, _getPointerData.getPointerData)(evt);

    return {
        x: data.clientX,
        y: data.clientY
    };
};