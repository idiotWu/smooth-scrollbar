'use strict';

var _smoothScrollbar = require('../smooth-scrollbar');

var _utils = require('../utils/');

/**
 * @method
 * @internal
 * Mouse event handlers builder
 */
/**
 * @module
 * @prototype {Function} __mouseHandler
 */

function __mouseHandler() {
    var _this = this;

    var _targets = this.targets,
        container = _targets.container,
        xAxis = _targets.xAxis,
        yAxis = _targets.yAxis;


    var getDest = function getDest(direction, offsetOnTrack) {
        var size = _this.size,
            thumbSize = _this.thumbSize;


        if (direction === 'x') {
            var totalWidth = size.container.width - (thumbSize.x - thumbSize.realX);

            return offsetOnTrack / totalWidth * size.content.width;
        }

        if (direction === 'y') {
            var totalHeight = size.container.height - (thumbSize.y - thumbSize.realY);

            return offsetOnTrack / totalHeight * size.content.height;
        }

        return 0;
    };

    var getTrackDir = function getTrackDir(elem) {
        if ((0, _utils.isOneOf)(elem, [xAxis.track, xAxis.thumb])) return 'x';
        if ((0, _utils.isOneOf)(elem, [yAxis.track, yAxis.thumb])) return 'y';
    };

    var isMouseDown = void 0,
        isMouseMoving = void 0,
        startOffsetToThumb = void 0,
        startTrackDirection = void 0,
        containerRect = void 0;

    this.__addEvent(container, 'click', function (evt) {
        if (isMouseMoving || !(0, _utils.isOneOf)(evt.target, [xAxis.track, yAxis.track])) return;

        var track = evt.target;
        var direction = getTrackDir(track);
        var rect = track.getBoundingClientRect();
        var clickPos = (0, _utils.getPosition)(evt);

        var offset = _this.offset,
            thumbSize = _this.thumbSize;


        if (direction === 'x') {
            var offsetOnTrack = clickPos.x - rect.left - thumbSize.x / 2;
            _this.__setMovement(getDest(direction, offsetOnTrack) - offset.x, 0);
        } else {
            var _offsetOnTrack = clickPos.y - rect.top - thumbSize.y / 2;
            _this.__setMovement(0, getDest(direction, _offsetOnTrack) - offset.y);
        }
    });

    this.__addEvent(container, 'mousedown', function (evt) {
        if (!(0, _utils.isOneOf)(evt.target, [xAxis.thumb, yAxis.thumb])) return;

        isMouseDown = true;

        var cursorPos = (0, _utils.getPosition)(evt);
        var thumbRect = evt.target.getBoundingClientRect();

        startTrackDirection = getTrackDir(evt.target);

        // pointer offset to thumb
        startOffsetToThumb = {
            x: cursorPos.x - thumbRect.left,
            y: cursorPos.y - thumbRect.top
        };

        // container bounding rectangle
        containerRect = _this.targets.container.getBoundingClientRect();
    });

    this.__addEvent(window, 'mousemove', function (evt) {
        if (!isMouseDown) return;

        evt.preventDefault();
        isMouseMoving = true;

        var offset = _this.offset;

        var cursorPos = (0, _utils.getPosition)(evt);

        if (startTrackDirection === 'x') {
            // get percentage of pointer position in track
            // then tranform to px
            // don't need easing
            var offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
            _this.setPosition(getDest(startTrackDirection, offsetOnTrack), offset.y);
        }

        if (startTrackDirection === 'y') {
            var _offsetOnTrack2 = cursorPos.y - startOffsetToThumb.y - containerRect.top;
            _this.setPosition(offset.x, getDest(startTrackDirection, _offsetOnTrack2));
        }
    });

    // release mousemove spy on window lost focus
    this.__addEvent(window, 'mouseup blur', function () {
        isMouseDown = isMouseMoving = false;
    });
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__mouseHandler', {
    value: __mouseHandler,
    writable: true,
    configurable: true
});