'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
                                                                                                                                                                                                              * @module
                                                                                                                                                                                                              * @prototype {Function} __setMovement
                                                                                                                                                                                                              */

function __setMovement() {
    var deltaX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var deltaY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var allowOverscroll = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var options = this.options,
        movement = this.movement;


    this.__updateThrottle();

    var limit = this.__getDeltaLimit(allowOverscroll);

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    movement.x = _utils.pickInRange.apply(undefined, [deltaX].concat(_toConsumableArray(limit.x)));
    movement.y = _utils.pickInRange.apply(undefined, [deltaY].concat(_toConsumableArray(limit.y)));
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__setMovement', {
    value: __setMovement,
    writable: true,
    configurable: true
});