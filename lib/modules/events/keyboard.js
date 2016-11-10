'use strict';

var _isIterable2 = require('babel-runtime/core-js/is-iterable');

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if ((0, _isIterable3.default)(Object(arr))) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.handleKeyboardEvents = handleKeyboardEvents;

var _utils = require('../utils/');

var _dom = require('../dom/');

var _render = require('../render/');

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
 * Keyboard events handlers
 * @private
 */
function handleKeyboardEvents() {
    var _this = this;

    var _ref = _utils.getPrivateProp.call(this),
        targets = _ref.targets;

    var getKeyDelta = function getKeyDelta(keyCode) {
        // need real time data
        var _ref2 = _utils.getPrivateProp.call(_this),
            size = _ref2.size,
            offset = _ref2.offset,
            limit = _ref2.limit,
            movement = _ref2.movement;

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

    _dom.addEvent.call(this, container, 'focus', function () {
        isFocused = true;
    });

    _dom.addEvent.call(this, container, 'blur', function () {
        isFocused = false;
    });

    _dom.addEvent.call(this, container, 'keydown', function (evt) {
        if (!isFocused) return;

        var _ref3 = _utils.getPrivateProp.call(_this),
            options = _ref3.options,
            parents = _ref3.parents;

        var delta = getKeyDelta(evt.keyCode || evt.which);

        if (!delta) return;

        var _delta = _slicedToArray(delta, 2),
            x = _delta[0],
            y = _delta[1];

        if (_render.shouldPropagateMovement.call(_this, x, y)) {
            container.blur();

            if (parents.length) {
                parents[0].containerElement.focus();
            }

            return _utils.callPrivateMethod.call(_this, 'updateDebounce');
        }

        evt.preventDefault();

        var speed = options.speed;

        _render.addMovement.call(_this, x * speed, y * speed);
    });
};