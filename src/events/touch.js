/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { GLOBAL_ENV } from '../shared/';
import { pickInRange } from '../utils/';

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

        this.__addMovement(x, y, true);
        activeScrollbar = this;
    });

    this.__addEvent(container, 'touchcancel touchend', (evt) => {
        if (this.__isDrag) return;

        const { speed } = this.options;

        const velocity = __touchRecord.getVelocity();
        const movement = {};

        Object.keys(velocity).forEach(dir => {
            const value = pickInRange(velocity[dir] * GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

            // throw small values
            movement[dir] = Math.abs(value) > MIN_VELOCITY ? (value * speed) : 0;
        });

        this.__addMovement(
            movement.x,
            movement.y,
            true
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
