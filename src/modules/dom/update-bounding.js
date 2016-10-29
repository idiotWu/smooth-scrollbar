import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

/**
 * Update container's bounding rect
 * @private
 */
export function updateBounding() {
    const {
        container,
    } = this::getPrivateProp('targets');

    const {
        top,
        right,
        bottom,
        left,
    } = container.getBoundingClientRect();

    const {
        innerHeight,
        innerWidth,
    } = window;

    this::setPrivateProp('bounding', {
        top: Math.max(top, 0),
        right: Math.min(right, innerWidth),
        bottom: Math.min(bottom, innerHeight),
        left: Math.max(left, 0),
    });
};
