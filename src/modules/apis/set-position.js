import {
    pickInRange,
    setStyle,
} from '../../helpers/';

import {
    setPrivateProp,
    getPrivateProp,
    callPrivateMethod,
} from '../utils/';

import {
    updateThumbPosition,
} from '../dom/';

import { showTrack } from './toggle-track';

/**
 * Set scrollbar position without transition
 * @public
 * @param {number} [x] - scrollbar position in x axis
 * @param {number} [y] - scrollbar position in y axis
 * @param {boolean} [withoutCallbacks] - disable callback functions temporarily
 */
export function setPosition(x = this.offset.x, y = this.offset.y, withoutCallbacks = false) {
    this::callPrivateMethod('hideTrackDebounce');

    const status = {};

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

    status.direction = {
        x: x === offset.x ? 'none' : (x > offset.x ? 'right' : 'left'),
        y: y === offset.y ? 'none' : (y > offset.y ? 'down' : 'up'),
    };

    this::setPrivateProp('offset', { x, y });

    status.offset = { x, y };
    status.limit = { ...limit };

    // update thumb position after offset update
    this::updateThumbPosition();

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
