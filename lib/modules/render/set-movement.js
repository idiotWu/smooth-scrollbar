'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.setMovement = setMovement;

var _helpers = require('../../helpers');

var _getDeltaLimit = require('./get-delta-limit');

var _utils = require('../utils/');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

/**
 * Set scroll movement
 * @private
 * @param {number}  [deltaX]
 * @param {number}  [deltaY]
 * @param {boolean} [allowOverscroll] - Whether allow overscroll or not
 */
function setMovement() {
    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var allowOverscroll = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    var _ref = _utils.getPrivateProp.call(this);

    var options = _ref.options;
    var movement = _ref.movement;


    _utils.callPrivateMethod.call(this, 'updateThrottle');

    var limit = _getDeltaLimit.getDeltaLimit.call(this, allowOverscroll);

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    movement.x = _helpers.pickInRange.apply(undefined, [deltaX].concat(_toConsumableArray(limit.x)));
    movement.y = _helpers.pickInRange.apply(undefined, [deltaY].concat(_toConsumableArray(limit.y)));
};