/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { GLOBAL_ENV } from '../shared/';

const MIN_VELOCITY = 100;

let activeScrollbar = null;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
function __touchHandler() {
    const {
        targets,
        movementLocked,
        __touchRecord,
    } = this;

    const {
        container,
    } = targets;

    this.__addEvent(container, 'touchstart', (evt) => {
        if (this.__isDrag) return;

        const { __timerID, movement } = this;

        // stop scrolling but keep movement for overscrolling
        cancelAnimationFrame(__timerID.scrollTo);
        if (!this.__willOverscroll('x')) movement.x = 0;
        if (!this.__willOverscroll('y')) movement.y = 0;

        // start records
        __touchRecord.track(evt);
        this.__autoLockMovement();
    });

    this.__addEvent(container, 'touchmove', (evt) => {
        if (this.__isDrag) return;
        if (activeScrollbar && activeScrollbar !== this) return;

        __touchRecord.update(evt);

        let { x, y } = __touchRecord.getDelta();

        if (this.__shouldPropagateMovement(x, y)) {
            return this.__updateThrottle();
        }

        const { movement, MAX_OVERSCROLL, options } = this;

        if (movement.x && this.__willOverscroll('x', x)) {
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
        if (movement.y && this.__willOverscroll('y', y)) {
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

        this.__autoLockMovement();

        evt.preventDefault();

        this.__addMovement(x, y);
        activeScrollbar = this;
    });

    this.__addEvent(container, 'touchcancel touchend', (evt) => {
        if (this.__isDrag) return;

        const { speed } = this.options;

        let { x, y } = __touchRecord.getVelocity();

        x = movementLocked.x ? 0 : Math.min(x * GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        this.__addMovement(
            Math.abs(x) > MIN_VELOCITY ? (x * speed) : 0,
            Math.abs(y) > MIN_VELOCITY ? (y * speed) : 0
        );

        this.__unlockMovement();
        __touchRecord.release(evt);
        activeScrollbar = null;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true,
});
