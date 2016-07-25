/**
 * @module
 * @prototype {Function} __setThumbPosition
 */

import { setStyle } from '../utils/';
import { SmoothScrollbar } from '../smooth-scrollbar';

/**
 * @method
 * @internal
 * Set thumb position in track
 */
function __setThumbPosition() {
    const {
        targets,
        size,
        offset,
        thumbOffset,
        thumbSize,
    } = this;

    thumbOffset.x = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));

    thumbOffset.y = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

    setStyle(targets.xAxis.thumb, {
        '-transform': `translate3d(${thumbOffset.x}px, 0, 0)`,
    });

    setStyle(targets.yAxis.thumb, {
        '-transform': `translate3d(0, ${thumbOffset.y}px, 0)`,
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__setThumbPosition', {
    value: __setThumbPosition,
    writable: true,
    configurable: true,
});
