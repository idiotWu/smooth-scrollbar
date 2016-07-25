'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _utils = require('../utils/');

var _smoothScrollbar = require('../smooth-scrollbar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @prototype {Function} __setMovement
 */

function __setMovement() {
    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var options = this.options;
    var movement = this.movement;


    this.__updateThrottle();

    var limit = this.__getDeltaLimit();

    if (options.renderByPixels) {
        // ensure resolved with integer
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
    }

    movement.x = _utils.pickInRange.apply(undefined, [deltaX].concat((0, _toConsumableArray3.default)(limit.x)));
    movement.y = _utils.pickInRange.apply(undefined, [deltaY].concat((0, _toConsumableArray3.default)(limit.y)));
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__setMovement', {
    value: __setMovement,
    writable: true,
    configurable: true
});