import {
    getDelta,
    debounce,
} from '../../helpers/';

import {
    GLOBAL_ENV,
} from '../../contants/';

import {
    getPrivateProp,
} from '../namespace/';

import {
    updateDebounced,
} from '../debounced/';

import {
    willOverscroll,
} from '../overscroll/';

import {
    addMovement,
    shouldPropagateMovement,
} from '../movement/';

import { addEvent } from './add-event';

/**
 * Wheel events handler
 * @private
 */
export function handleWheelEvents() {
    const {
        container,
    } = this::getPrivateProp('targets');

    let wheelLocked = false;

    // since we can't detect whether user release touchpad
    // handle it with debounce is the best solution now, as a trade-off
    const releaseWheel = debounce(() => {
        wheelLocked = false;
    }, 30, false);

    this::addEvent(container, GLOBAL_ENV.WHEEL_EVENT, (evt) => {
        const {
            options,
        } = this::getPrivateProp();

        let { x, y } = getDelta(evt);

        x *= options.speed;
        y *= options.speed;

        if (this::shouldPropagateMovement(x, y)) {
            return this::updateDebounced();
        }

        evt.preventDefault();
        releaseWheel();

        if (this::getPrivateProp('overscrollBack')) {
            wheelLocked = true;
        }

        if (wheelLocked) {
            if (this::willOverscroll('x', x)) x = 0;
            if (this::willOverscroll('y', y)) y = 0;
        }

        this::addMovement(x, y, true);
    });
};
