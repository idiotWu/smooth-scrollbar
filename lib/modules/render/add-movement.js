'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.addMovement = addMovement;

var _helpers = require('../../helpers/');

var _getDeltaLimit = require('./get-delta-limit');

var _utils = require('../utils/');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

/**
 * Add scroll movement
 * @private
 * @param {number}  [deltaX]
 * @param {number}  [deltaY]
 * @param {boolean} [allowOverscroll] - Whether allow overscroll or not
 */
function addMovement() {
    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var allowOverscroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _ref = _utils.getPrivateProp.call(this),
        limit = _ref.limit,
        options = _ref.options,
        movement = _ref.movement;

    _utils.callPrivateMethod.call(this, 'updateDebounce');

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    var x = limit.x === 0 ? 0 : movement.x + deltaX;
    var y = limit.y === 0 ? 0 : movement.y + deltaY;

    var deltaLimit = _getDeltaLimit.getDeltaLimit.call(this, allowOverscroll);

    movement.x = _helpers.pickInRange.apply(undefined, [x].concat(_toConsumableArray(deltaLimit.x)));
    movement.y = _helpers.pickInRange.apply(undefined, [y].concat(_toConsumableArray(deltaLimit.y)));
};