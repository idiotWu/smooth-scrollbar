/**
 * @module
 * @prototype {Function} __mouseHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getPosition, getTouchID, pickInRange } from '../utils/';

export { SmoothScrollbar };

/**
 * @method
 * @internal
 * Mouse event handlers builder
 *
 * @param {Object} option
 */
let __mouseHandler = function() {
    const { container } = this.targets;
    let isMouseDown, isMouseMove, startOffsetToThumb, startTrackDirection, containerRect;

    let getTrackDir = (className) => {
        let matches = className.match(/scrollbar\-(?:track|thumb)\-([xy])/);

        return matches && matches[1];
    };

    this.__addEvent(container, 'click', (evt) => {
        if (isMouseMove || !/scrollbar-track/.test(evt.target.className) || this.__ignoreEvent(evt)) return;

        let track = evt.target;
        let direction = getTrackDir(track.className);
        let rect = track.getBoundingClientRect();
        let clickPos = getPosition(evt);
        let deltaLimit = this.__getDeltaLimit();

        const { size, offset, thumbSize } = this;

        if (direction === 'x') {
            let clickOffset = (clickPos.x - rect.left - thumbSize.x / 2) / (size.container.width - (thumbSize.x - thumbSize.realX));
            this.movement.x = pickInRange(clickOffset * size.content.width - offset.x, ...deltaLimit.x);
        } else {
            let clickOffset = (clickPos.y - rect.top - thumbSize.y / 2) / (size.container.height - (thumbSize.y - thumbSize.realY));
            this.movement.y = pickInRange(clickOffset * size.content.height - offset.y, ...deltaLimit.y);
        }
    });

    this.__addEvent(container, 'mousedown', (evt) => {
        if (!/scrollbar-thumb/.test(evt.target.className) || this.__ignoreEvent(evt)) return;
        isMouseDown = true;

        let cursorPos = getPosition(evt);
        let thumbRect = evt.target.getBoundingClientRect();

        startTrackDirection = getTrackDir(evt.target.className);

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

        isMouseMove = true;
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
        isMouseDown = isMouseMove = false;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__mouseHandler', {
    value: __mouseHandler,
    writable: true,
    configurable: true
});
