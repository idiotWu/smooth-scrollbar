'use strict';

var _isIterable2 = require('babel-runtime/core-js/is-iterable');

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if ((0, _isIterable3.default)(Object(arr))) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @prototype {Function} __keyboardHandler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

var KEY_CODE = {
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

/**
 * @method
 * @internal
 * Keypress event handler builder
 */
function __keyboardHandler() {
    var _this = this;

    var targets = this.targets;


    var getKeyDelta = function getKeyDelta(keyCode) {
        // key maps [deltaX, deltaY, useSetMethod]
        var size = _this.size;
        var offset = _this.offset;
        var limit = _this.limit;
        var movement = _this.movement; // need real time data

        switch (keyCode) {
            case KEY_CODE.SPACE:
                return [0, 200];
            case KEY_CODE.PAGE_UP:
                return [0, -size.container.height + 40];
            case KEY_CODE.PAGE_DOWN:
                return [0, size.container.height - 40];
            case KEY_CODE.END:
                return [0, Math.abs(movement.y) + limit.y - offset.y];
            case KEY_CODE.HOME:
                return [0, -Math.abs(movement.y) - offset.y];
            case KEY_CODE.LEFT:
                return [-40, 0];
            case KEY_CODE.UP:
                return [0, -40];
            case KEY_CODE.RIGHT:
                return [40, 0];
            case KEY_CODE.DOWN:
                return [0, 40];
            default:
                return null;
        }
    };

    var container = targets.container;


    var isFocused = false;

    this.__addEvent(container, 'focus', function () {
        isFocused = true;
    });

    this.__addEvent(container, 'blur', function () {
        isFocused = false;
    });

    this.__addEvent(container, 'keydown', function (evt) {
        if (!isFocused) return;

        var options = _this.options;
        var parents = _this.parents;
        var movementLocked = _this.movementLocked;


        var delta = getKeyDelta(evt.keyCode || evt.which);

        if (!delta) return;

        var _delta = _slicedToArray(delta, 2);

        var x = _delta[0];
        var y = _delta[1];


        if (_this.__shouldPropagateMovement(x, y)) {
            container.blur();

            if (parents.length) {
                parents[0].focus();
            }

            return _this.__updateThrottle();
        }

        evt.preventDefault();

        _this.__unlockMovement(); // handle for multi keypress
        if (x && _this.__willOverscroll('x', x)) movementLocked.x = true;
        if (y && _this.__willOverscroll('y', y)) movementLocked.y = true;

        var speed = options.speed;

        _this.__addMovement(x * speed, y * speed);
    });

    this.__addEvent(container, 'keyup', function () {
        _this.__unlockMovement();
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__keyboardHandler', {
    value: __keyboardHandler,
    writable: true,
    configurable: true
});