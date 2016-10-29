import {
    setStyle,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../utils/';

/**
 * Update thumb position
 */
export function updateThumbPosition() {
    const {
        targets,
        size,
        offset,
        thumbOffset,
        thumbSize,
    } = this::getPrivateProp();

    thumbOffset.x = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));

    thumbOffset.y = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));

    setStyle(targets.xAxis.thumb, {
        '-transform': `translate3d(${thumbOffset.x}px, 0, 0)`,
    });

    setStyle(targets.yAxis.thumb, {
        '-transform': `translate3d(0, ${thumbOffset.y}px, 0)`,
    });
};
