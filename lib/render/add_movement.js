'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _utils = require('../utils/');

var _smooth_scrollbar = require('../smooth_scrollbar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

    movement.x = _utils.pickInRange.apply(undefined, [x].concat((0, _toConsumableArray3.default)(deltaLimit.x)));
    movement.y = _utils.pickInRange.apply(undefined, [y].concat((0, _toConsumableArray3.default)(deltaLimit.y)));
};

Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__addMovement', {
    value: __addMovement,
    writable: true,
    configurable: true
});