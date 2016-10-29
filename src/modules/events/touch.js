import {
    GLOBAL_ENV,
} from '../../contants/';

import {
    getPrivateProp,
    callPrivateMethod,
} from '../utils/';

import {
    addEvent,
} from '../dom/';

import {
    willOverscroll,
} from '../overscroll/';

import {
    addMovement,
    unlockMovement,
    autoLockMovement,
    shouldPropagateMovement,
} from '../render/';

const MIN_VELOCITY = 100;

let activeScrollbar = null;

/**
 * Touch events handler
 * @private
 */
export function handleTouchEvents() {
    const {
        targets,
        movementLocked,
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

        let { x, y } = touchRecord.getDelta();

        if (this::shouldPropagateMovement(x, y)) {
            return this::callPrivateMethod('updateDebounce');
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

        const {
            speed,
        } = this::getPrivateProp('options');

        let { x, y } = touchRecord.getVelocity();

        x = movementLocked.x ? 0 : Math.min(x * GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        this::addMovement(
            Math.abs(x) > MIN_VELOCITY ? (x * speed) : 0,
            Math.abs(y) > MIN_VELOCITY ? (y * speed) : 0,
            true
        );

        this::unlockMovement();
        touchRecord.release(evt);
        activeScrollbar = null;
    });
};
