/**
 * @module
 * @prototype {Function} __setThumbPosition
 */

import { setStyle } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @internal
 * Set thumb position in track
 */
function __setThumbPosition() {
    const { targets, size, offset, thumbSize } = this;

    let thumbPositionX = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));
    let thumbPositionY = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

    setStyle(targets.xAxis.thumb, {
        '-transform':  `translate3d(${thumbPositionX}px, 0, 0)`
    });

    setStyle(targets.yAxis.thumb, {
        '-transform': `translate3d(0, ${thumbPositionY}px, 0)`
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__setThumbPosition', {
    value: __setThumbPosition,
    writable: true,
    configurable: true
});
