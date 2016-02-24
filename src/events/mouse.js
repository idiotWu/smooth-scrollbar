/**
 * @module
 * @prototype {Function} __mouseHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { getPosition, getTouchID, pickInRange } from '../utils/index';

export { SmoothScrollbar };

const TRACK_DIRECTION = {
    x: [0, 1],
    y: [1, 0]
};

let getTrackDir = (className) => {
    let matches = className.match(/scrollbar\-(?:track|thumb)\-([xy])/);

    return matches && matches[1];
};

/**
 * @method
 * @internal
 * Mouse event handlers builder
 *
 * @param {Object} option
 */
let __mouseHandler = function() {
    let isMouseDown, isMouseMove, startOffsetToThumb, startTrackDirection, containerRect;
    let { container } = this.targets;

    this.__addEvent(container, 'click', (evt) => {
        if (isMouseMove || !/track/.test(evt.target.className) || this.__ignoreEvent(evt)) return;

        let track = evt.target;
        let direction = getTrackDir(track.className);
        let rect = track.getBoundingClientRect();
        let clickPos = getPosition(evt);

        let { size, offset } = this;

        if (direction === 'x') {
            // use percentage value
            let thumbSize = pickInRange(size.container.width / size.content.width, 0, 1);
            let clickOffset = (clickPos.x - rect.left) / size.container.width;

            return this.scrollTo(
                (clickOffset - thumbSize / 2) * size.content.width,
                offset.y,
                1e3
            );
        }

        let thumbSize = pickInRange(size.container.height / size.content.height, 0, 1);
        let clickOffset = (clickPos.y - rect.top) / size.container.height;

        this.scrollTo(
            offset.x,
            (clickOffset - thumbSize / 2) * size.content.height,
            1e3
        );
    });

    this.__addEvent(container, 'mousedown', (evt) => {
        if (!/thumb/.test(evt.target.className) || this.__ignoreEvent(evt)) return;
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
