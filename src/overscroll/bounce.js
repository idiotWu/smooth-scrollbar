/**
 * @module
 * @this-bind
 * @export {Function} overscrollBounce
 */

import { setStyle } from '../utils/';

export function overscrollBounce(x, y) {
    const {
        size,
        offset,
        targets,
        thumbOffset,
    } = this;

    const {
        xAxis,
        yAxis,
        content,
    } = targets;

    setStyle(content, {
        '-transform': `translate3d(${-(offset.x + x)}px, ${-(offset.y + y)}px, 0)`,
    });

    if (x) {
        const ratio = size.container.width / (size.container.width + Math.abs(x));

        setStyle(xAxis.thumb, {
            '-transform': `translate3d(${thumbOffset.x}px, 0, 0) scale3d(${ratio}, 1, 1)`,
            '-transform-origin': x < 0 ? 'left' : 'right',
        });
    }

    if (y) {
        const ratio = size.container.height / (size.container.height + Math.abs(y));

        setStyle(yAxis.thumb, {
            '-transform': `translate3d(0, ${thumbOffset.y}px, 0) scale3d(1, ${ratio}, 1)`,
            '-transform-origin': y < 0 ? 'top' : 'bottom',
        });
    }
}
