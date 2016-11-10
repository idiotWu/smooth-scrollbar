'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

/**
 * @module
 * @prototype {Function} __dragHandler
 */

function __dragHandler() {
    var _this = this;

    var _targets = this.targets,
        container = _targets.container,
        content = _targets.content;


    var isDrag = false;
    var animation = void 0,
        padding = void 0;

    Object.defineProperty(this, '__isDrag', {
        get: function get() {
            return isDrag;
        },

        enumerable: false
    });

    var scroll = function scroll(_ref) {
        var x = _ref.x,
            y = _ref.y;

        if (!x && !y) return;

        var speed = _this.options.speed;


        _this.__setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(function () {
            scroll({ x: x, y: y });
        });
    };

    this.__addEvent(container, 'dragstart', function (evt) {
        if (_this.__eventFromChildScrollbar(evt)) return;

        isDrag = true;
        padding = evt.target.clientHeight;

        (0, _utils.setStyle)(content, {
            'pointer-events': 'auto'
        });

        cancelAnimationFrame(animation);
        _this.__updateBounding();
    });

    this.__addEvent(document, 'dragover mousemove touchmove', function (evt) {
        if (!isDrag || _this.__eventFromChildScrollbar(evt)) return;
        cancelAnimationFrame(animation);
        evt.preventDefault();

        var dir = _this.__getPointerTrend(evt, padding);

        scroll(dir);
    });

    this.__addEvent(document, 'dragend mouseup touchend blur', function () {
        cancelAnimationFrame(animation);
        isDrag = false;
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__dragHandler', {
    value: __dragHandler,
    writable: true,
    configurable: true
});