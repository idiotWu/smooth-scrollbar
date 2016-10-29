'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleMouseEvents = handleMouseEvents;

var _helpers = require('../../helpers/');

var _utils = require('../utils/');

var _dom = require('../dom/');

var _render = require('../render/');

var _apis = require('../apis/');

/**
 * Mouse events handlers
 * @private
 */
function handleMouseEvents() {
    var _this = this;

    var _ref = _utils.getPrivateProp.call(this, 'targets'),
        container = _ref.container,
        xAxis = _ref.xAxis,
        yAxis = _ref.yAxis;

    var getDest = function getDest(direction, offsetOnTrack) {
        var _ref2 = _utils.getPrivateProp.call(_this),
            size = _ref2.size,
            thumbSize = _ref2.thumbSize;

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
        if ((0, _helpers.isOneOf)(elem, [xAxis.track, xAxis.thumb])) return 'x';
        if ((0, _helpers.isOneOf)(elem, [yAxis.track, yAxis.thumb])) return 'y';
    };

    var isMouseDown = void 0,
        isMouseMoving = void 0,
        startOffsetToThumb = void 0,
        startTrackDirection = void 0,
        containerRect = void 0;

    _dom.addEvent.call(this, container, 'click', function (evt) {
        if (isMouseMoving || !(0, _helpers.isOneOf)(evt.target, [xAxis.track, yAxis.track])) return;

        var track = evt.target;
        var direction = getTrackDir(track);
        var rect = track.getBoundingClientRect();
        var clickPos = (0, _helpers.getPointerPosition)(evt);

        var _ref3 = _utils.getPrivateProp.call(_this),
            offset = _ref3.offset,
            thumbSize = _ref3.thumbSize;

        if (direction === 'x') {
            var offsetOnTrack = clickPos.x - rect.left - thumbSize.x / 2;
            _render.setMovement.call(_this, getDest(direction, offsetOnTrack) - offset.x, 0);
        } else {
            var _offsetOnTrack = clickPos.y - rect.top - thumbSize.y / 2;
            _render.setMovement.call(_this, 0, getDest(direction, _offsetOnTrack) - offset.y);
        }
    });

    _dom.addEvent.call(this, container, 'mousedown', function (evt) {
        if (!(0, _helpers.isOneOf)(evt.target, [xAxis.thumb, yAxis.thumb])) return;

        isMouseDown = true;

        var cursorPos = (0, _helpers.getPointerPosition)(evt);
        var thumbRect = evt.target.getBoundingClientRect();

        startTrackDirection = getTrackDir(evt.target);

        // pointer offset to thumb
        startOffsetToThumb = {
            x: cursorPos.x - thumbRect.left,
            y: cursorPos.y - thumbRect.top
        };

        // container bounding rectangle
        containerRect = container.getBoundingClientRect();
    });

    _dom.addEvent.call(this, window, 'mousemove', function (evt) {
        if (!isMouseDown) return;

        evt.preventDefault();
        isMouseMoving = true;

        var _ref4 = _utils.getPrivateProp.call(_this),
            offset = _ref4.offset;

        var cursorPos = (0, _helpers.getPointerPosition)(evt);

        if (startTrackDirection === 'x') {
            // get percentage of pointer position in track
            // then tranform to px
            // don't need easing
            var offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
            _apis.setPosition.call(_this, getDest(startTrackDirection, offsetOnTrack), offset.y);
        }

        if (startTrackDirection === 'y') {
            var _offsetOnTrack2 = cursorPos.y - startOffsetToThumb.y - containerRect.top;
            _apis.setPosition.call(_this, offset.x, getDest(startTrackDirection, _offsetOnTrack2));
        }
    });

    // release mousemove spy on window lost focus
    _dom.addEvent.call(this, window, 'mouseup blur', function () {
        isMouseDown = isMouseMoving = false;
    });
};