import {
    GLOBAL_ENV,
} from '../../contants/';

import {
    pickInRange,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../namespace/';

import {
    updateDebounced,
} from '../debounced/';

import {
    addMovement,
    shouldPropagateMovement,
} from '../movement/';

import {
    willOverscroll,
    unlockMovement,
    autoLockMovement,
} from '../overscroll/';

import { addEvent } from '../utils/';

const MIN_VELOCITY = 100;

let activeScrollbar = null;

/**
 * Touch events handler
 * @private
 */
export function handleTouchEvents() {
    const {
        targets,
        touchRecord,
    } = this::getPrivateProp();

    const {
        container,
    } = targets;

    this::addEvent(container, 'touchstart', (evt) => {
        if (this::getPrivateProp('isDraging')) return;

        const {
            timerID,
            movement,
        } = this::getPrivateProp();

        // stop scrolling but keep movement for overscrolling
        cancelAnimationFrame(timerID.scrollTo);
        if (!this::willOverscroll('x')) movement.x = 0;
        if (!this::willOverscroll('y')) movement.y = 0;

        // start records
        touchRecord.track(evt);
        this::autoLockMovement();
    });

    this::addEvent(container, 'touchmove', (evt) => {
        if (this::getPrivateProp('isDraging')) return;
        if (activeScrollbar && activeScrollbar !== this) return;

        touchRecord.update(evt);

        let { x, y } = touchRecord.getCurrentDelta();

        if (this::shouldPropagateMovement(x, y)) {
            return this::updateDebounced();
        }

        const {
            movement,
            options,
            MAX_OVERSCROLL,
        } = this::getPrivateProp();

        if (movement.x && this::willOverscroll('x', x)) {
            let factor = 2;

            if (options.overscrollEffect === 'bounce') {
                factor += Math.abs(10 * movement.x / MAX_OVERSCROLL);
            }

            if (Math.abs(movement.x) >= MAX_OVERSCROLL) {
                x = 0;
            } else {
                x /= factor;
            }
        }
        if (movement.y && this::willOverscroll('y', y)) {
            let factor = 2;

            if (options.overscrollEffect === 'bounce') {
                factor += Math.abs(10 * movement.y / MAX_OVERSCROLL);
            }

            if (Math.abs(movement.y) >= MAX_OVERSCROLL) {
                y = 0;
            } else {
                y /= factor;
            }
        }

        this::autoLockMovement();

        evt.preventDefault();

        this::addMovement(x, y, true);
        activeScrollbar = this;
    });

    this::addEvent(container, 'touchcancel touchend', (evt) => {
        if (this::getPrivateProp('isDraging')) return;

        touchRecord.release(evt);

        if (touchRecord.isActive()) {
            // still active
            return;
        }

        const {
            speed,
        } = this::getPrivateProp('options');

        const velocity = touchRecord.getLastVelocity();
        const movement = {};

        Object.keys(velocity).forEach(dir => {
            const value = pickInRange(velocity[dir] * GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

            // throw small values
            movement[dir] = Math.abs(value) > MIN_VELOCITY ? (value * speed) : 0;
        });

        this::addMovement(
            movement.x,
            movement.y,
            true
        );

        this::unlockMovement();

        activeScrollbar = null;
    });
};
