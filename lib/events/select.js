'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

// todo: select handler for touch screen
/**
 * @module
 * @prototype {Function} __selectHandler
 */

function __selectHandler() {
    var _this = this;

    var isSelected = false;
    var animation = void 0;

    var _targets = this.targets;
    var container = _targets.container;
    var content = _targets.content;


    var scroll = function scroll(_ref) {
        var x = _ref.x;
        var y = _ref.y;

        if (!x && !y) return;

        var speed = _this.options.speed;


        _this.__setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(function () {
            scroll({ x: x, y: y });
        });
    };

    var setSelect = function setSelect() {
        var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        (0, _utils.setStyle)(container, {
            '-user-select': value
        });
    };

    this.__addEvent(window, 'mousemove', function (evt) {
        if (!isSelected) return;

        cancelAnimationFrame(animation);

        var dir = _this.__getPointerTrend(evt);

        scroll(dir);
    });

    this.__addEvent(content, 'selectstart', function (evt) {
        if (_this.__eventFromChildScrollbar(evt)) {
            return setSelect('none');
        }

        cancelAnimationFrame(animation);

        _this.__updateBounding();
        isSelected = true;
    });

    this.__addEvent(window, 'mouseup blur', function () {
        cancelAnimationFrame(animation);
        setSelect();

        isSelected = false;
    });

    // temp patch for touch devices
    this.__addEvent(container, 'scroll', function (evt) {
        evt.preventDefault();
        container.scrollTop = container.scrollLeft = 0;
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__selectHandler', {
    value: __selectHandler,
    writable: true,
    configurable: true
});