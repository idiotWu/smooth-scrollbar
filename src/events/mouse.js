/**
 * @module
 * @prototype {Function} __mouseHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { isOneOf, getPosition } from '../utils/';

export { SmoothScrollbar };

/**
 * @method
 * @internal
 * Mouse event handlers builder
 *
 * @param {Object} option
 */
let __mouseHandler = function() {
    const { container, xAxis, yAxis } = this.targets;

    let isMouseDown, isMouseMoving, startOffsetToThumb, startTrackDirection, containerRect;

    let getTrackDir = (elem) => {
        if (isOneOf(elem, [xAxis.track, xAxis.thumb])) return 'x';
        if (isOneOf(elem, [yAxis.track, yAxis.thumb])) return 'y';
    };

    this.__addEvent(container, 'click', (evt) => {
        if (isMouseMoving || !isOneOf(evt.target, [xAxis.track, yAxis.track])) return;

        let track = evt.target;
        let direction = getTrackDir(track);
        let rect = track.getBoundingClientRect();
        let clickPos = getPosition(evt);

        const { size, offset, thumbSize } = this;

        if (direction === 'x') {
            let clickOffset = (clickPos.x - rect.left - thumbSize.x / 2) / (size.container.width - (thumbSize.x - thumbSize.realX));
            this.__setMovement(clickOffset * size.content.width - offset.x, 0);
        } else {
            let clickOffset = (clickPos.y - rect.top - thumbSize.y / 2) / (size.container.height - (thumbSize.y - thumbSize.realY));
            this.__setMovement(0, clickOffset * size.content.height - offset.y);
        }
    });

    this.__addEvent(container, 'mousedown', (evt) => {
        if (!isOneOf(evt.target, [xAxis.thumb, yAxis.thumb])) return;

        isMouseDown = true;

        let cursorPos = getPosition(evt);
        let thumbRect = evt.target.getBoundingClientRect();

        startTrackDirection = getTrackDir(evt.target);

        // pointer offset to thumb
        startOffsetToThumb = {
            x: cursorPos.x - thumbRect.left,
            y: cursorPos.y - thumbRect.top
        };

        // container bounding rectangle
        containerRect = this.targets.container.getBoundingClientRect();
    });

    this.__addEvent(window, 'mousemove', (evt) => {
        if (!isMouseDown) return;

        isMouseMoving = true;
        evt.preventDefault();

        let { size, offset } = this;
        let cursorPos = getPosition(evt);

        if (startTrackDirection === 'x') {
            // get percentage of pointer position in track
            // then tranform to px
            this.setPosition(
                (cursorPos.x - startOffsetToThumb.x - containerRect.left) / (containerRect.right - containerRect.left) * size.content.width,
                offset.y
            );

            return;
        }

        // don't need easing
        this.setPosition(
            offset.x,
            (cursorPos.y - startOffsetToThumb.y - containerRect.top) / (containerRect.bottom - containerRect.top) * size.content.height
        );
    });

    // release mousemove spy on window lost focus
    this.__addEvent(window, 'mouseup blur', () => {
        isMouseDown = isMouseMoving = false;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__mouseHandler', {
    value: __mouseHandler,
    writable: true,
    configurable: true
});
