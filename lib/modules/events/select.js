'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleSelectEvents = handleSelectEvents;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _core = require('../core/');

var _render = require('../render/');

/**
 * Select events handler
 * Todo: select handler for touch screen
 * @private
 */
function handleSelectEvents() {
    var _this = this;

    var isSelected = false;
    var animation = void 0;

    var _ref = _utils.getPrivateProp.call(this, 'targets'),
        container = _ref.container,
        content = _ref.content;

    var scroll = function scroll(_ref2) {
        var x = _ref2.x,
            y = _ref2.y;

        if (!x && !y) return;

        var _ref3 = _utils.getPrivateProp.call(_this, 'options'),
            speed = _ref3.speed;

        _render.setMovement.call(_this, x * speed, y * speed);

        animation = requestAnimationFrame(function () {
            scroll({ x: x, y: y });
        });
    };

    var setSelect = function setSelect() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

        (0, _helpers.setStyle)(container, {
            '-user-select': value
        });
    };

    _dom.addEvent.call(this, window, 'mousemove', function (evt) {
        if (!isSelected) return;

        cancelAnimationFrame(animation);

        var dir = _dom.getPointerOffset.call(_this, evt);

        scroll(dir);
    });

    _dom.addEvent.call(this, content, 'selectstart', function (evt) {
        if (_core.isFromNested.call(_this, evt)) {
            return setSelect('none');
        }

        cancelAnimationFrame(animation);

        _dom.updateBounding.call(_this);
        isSelected = true;
    });

    _dom.addEvent.call(this, window, 'mouseup blur', function () {
        cancelAnimationFrame(animation);
        setSelect();

        isSelected = false;
    });

    // temp patch for touch devices
    _dom.addEvent.call(this, container, 'scroll', function (evt) {
        evt.preventDefault();
        container.scrollTop = container.scrollLeft = 0;
    });
};