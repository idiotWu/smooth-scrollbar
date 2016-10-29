'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPrivateProp = getPrivateProp;

var _contants = require('../../contants/');

/**
 * Get private prop(s)
 * @private
 * @param {string} [prop] - Specify the property to be got, or the whole private props
 * @return {any}
 */
function getPrivateProp(prop) {
    var privateProps = this[_contants.PRIVATE_PROPS];

    if (typeof prop === 'undefined') {
        return privateProps;
    }

    return privateProps[prop];
};