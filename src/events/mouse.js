/**
 * @module
 * @prototype {Function} __mouseHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { isOneOf, getPosition } from '../utils/';

/**
 * @method
 * @internal
 * Mouse event handlers builder
 */
function __mouseHandler() {
    const { container, xAxis, yAxis } = this.targets;

    const getDest = (direction, offsetOnTrack) => {
        const {
            size,
            thumbSize,
        } = this;

        if (direction === 'x') {
            const totalWidth = size.container.width - (thumbSize.x - thumbSize.realX);

            return offsetOnTrack / totalWidth * size.content.width;
        }

        if (direction === 'y') {
            const totalHeight = size.container.height - (thumbSize.y - thumbSize.realY);

            return offsetOnTrack / totalHeight * size.content.height;
        }

        return 0;
    };

    const getTrackDir = (elem) => {
        if (isOneOf(elem, [xAxis.track, xAxis.thumb])) return 'x';
        if (isOneOf(elem, [yAxis.track, yAxis.thumb])) return 'y';
    };

    let isMouseDown, isMouseMoving, startOffsetToThumb, startTrackDirection, containerRect;

    this.__addEvent(container, 'click', (evt) => {
        if (isMouseMoving || !isOneOf(evt.target, [xAxis.track, yAxis.track])) return;

        const track = evt.target;
        const direction = getTrackDir(track);
        const rect = track.getBoundingClientRect();
        const clickPos = getPosition(evt);

        const { offset, thumbSize } = this;

        if (direction === 'x') {
            const offsetOnTrack = clickPos.x - rect.left - thumbSize.x / 2;
            this.__setMovement(getDest(direction, offsetOnTrack) - offset.x, 0);
        } else {
            const offsetOnTrack = clickPos.y - rect.top - thumbSize.y / 2;
            this.__setMovement(0, getDest(direction, offsetOnTrack) - offset.y);
        }
    });

    this.__addEvent(container, 'mousedown', (evt) => {
        if (!isOneOf(evt.target, [xAxis.thumb, yAxis.thumb])) return;

        isMouseDown = true;

        const cursorPos = getPosition(evt);
        const thumbRect = evt.target.getBoundingClientRect();

        startTrackDirection = getTrackDir(evt.target);

        // pointer offset to thumb
        startOffsetToThumb = {
            x: cursorPos.x - thumbRect.left,
            y: cursorPos.y - thumbRect.top,
        };

        // container bounding rectangle
        containerRect = this.targets.container.getBoundingClientRect();
    });

    this.__addEvent(window, 'mousemove', (evt) => {
        if (!isMouseDown) return;

        evt.preventDefault();
        isMouseMoving = true;

        const { offset } = this;
        const cursorPos = getPosition(evt);

        if (startTrackDirection === 'x') {
            // get percentage of pointer position in track
            // then tranform to px
            // don't need easing
            const offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
            this.setPosition(
                getDest(startTrackDirection, offsetOnTrack),
                offset.y
            );
        }

        if (startTrackDirection === 'y') {
            const offsetOnTrack = cursorPos.y - startOffsetToThumb.y - containerRect.top;
            this.setPosition(
                offset.x,
                getDest(startTrackDirection, offsetOnTrack)
            );
        }
    });

    // release mousemove spy on window lost focus
    this.__addEvent(window, 'mouseup blur', () => {
        isMouseDown = isMouseMoving = false;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__mouseHandler', {
    value: __mouseHandler,
    writable: true,
    configurable: true,
});
