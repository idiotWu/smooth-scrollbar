import {
    pickInRange,
    setStyle,
} from '../../helpers/';

import {
    setPrivateProp,
    getPrivateProp,
} from '../namespace/';

import {
    hideTrackDebounced,
} from '../debounced/hide-track-debounced'; // in case of circular deps

import {
    adjustThumbPosition,
    showTrack,
} from '../track/';

/**
 * Set scrollbar position without transition
 * @public
 * @api
 * @param {number} [x] - scrollbar position in x axis
 * @param {number} [y] - scrollbar position in y axis
 * @param {boolean} [withoutCallbacks] - disable callback functions temporarily
 */
export function setPosition(
    x = this::getPrivateProp('offset').x,
    y = this::getPrivateProp('offset').y,
    withoutCallbacks = false,
) {
    this::hideTrackDebounced();

    const {
        options,
        offset,
        limit,
        targets,
        scrollListeners,
    } = this::getPrivateProp();

    if (options.renderByPixels) {
        // ensure resolved with integer
        x = Math.round(x);
        y = Math.round(y);
    }

    if (Math.abs(x - offset.x) > 1) this::showTrack('x');
    if (Math.abs(y - offset.y) > 1) this::showTrack('y');

    x = pickInRange(x, 0, limit.x);
    y = pickInRange(y, 0, limit.y);

    if (x === offset.x && y === offset.y) return;

    const status = {};

    status.direction = {
        x: x === offset.x ? 'none' : (x > offset.x ? 'right' : 'left'),
        y: y === offset.y ? 'none' : (y > offset.y ? 'down' : 'up'),
    };

    this::setPrivateProp('offset', { x, y });

    status.offset = { x, y };
    status.limit = { ...limit };

    // update thumb position after offset update
    this::adjustThumbPosition();

    setStyle(targets.content, {
        '-transform': `translate3d(${-x}px, ${-y}px, 0)`,
    });

    // invoke all listeners
    if (withoutCallbacks) return;

    scrollListeners.forEach((fn) => {
        if (options.syncCallbacks) {
            fn(status);
        } else {
            requestAnimationFrame(() => {
                fn(status);
            });
        }
    });
};
