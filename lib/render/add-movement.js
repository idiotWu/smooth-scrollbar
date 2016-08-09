'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
                                                                                                                                                                                                              * @module
                                                                                                                                                                                                              * @prototype {Function} __addMovement
                                                                                                                                                                                                              */

function __addMovement() {
    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var limit = this.limit;
    var options = this.options;
    var movement = this.movement;


    this.__updateThrottle();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    var x = movement.x + deltaX;
    var y = movement.y + deltaY;

    if (limit.x === 0) x = 0;
    if (limit.y === 0) y = 0;

    var deltaLimit = this.__getDeltaLimit();

    movement.x = _utils.pickInRange.apply(undefined, [x].concat(_toConsumableArray(deltaLimit.x)));
    movement.y = _utils.pickInRange.apply(undefined, [y].concat(_toConsumableArray(deltaLimit.y)));
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});