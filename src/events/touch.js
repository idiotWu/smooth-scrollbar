/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { GLOBAL_TOUCHES, GLOBAL_ENV } from '../shared/';

const MIN_VELOCITY = 100;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
function __touchHandler() {
    const { targets, movementLocked } = this;
    const { container } = targets;

    let currentTouchID;

    this.__addEvent(container, 'touchstart', (evt) => {
        if (this.__isDrag) return;

        const { __timerID, movement } = this;

        // stop scrolling but keep movement for overscrolling
        cancelAnimationFrame(__timerID.scrollTo);
        if (!this.__isOntoEdge('x')) movement.x = 0;
        if (!this.__isOntoEdge('y')) movement.y = 0;

        // start records
        currentTouchID = GLOBAL_TOUCHES.start(evt);
        this.__autoLockMovement();
    });

    this.__addEvent(container, 'touchmove', (evt) => {
        if (this.__isDrag) return;

        if (!GLOBAL_TOUCHES.isActiveTouch(evt)) return;

        if (GLOBAL_TOUCHES.hasActiveScrollbar() &&
            !GLOBAL_TOUCHES.isActiveScrollbar(this)) return;

        let { x, y } = GLOBAL_TOUCHES.update(evt);

        if (this.__shouldPropagateMovement(x, y)) {
            return this.__updateThrottle();
        }

        const { movement, MAX_OVERSCROLL, options } = this;

        if (movement.x && this.__isOntoEdge('x', x)) {
            let factor = 2;
            if (options.overscrollEffect === 'bounce') factor += Math.abs(8 * movement.x / MAX_OVERSCROLL);

            x /= factor;
        }
        if (movement.y && this.__isOntoEdge('y', y)) {
            let factor = 2;
            if (options.overscrollEffect === 'bounce') factor += Math.abs(8 * movement.y / MAX_OVERSCROLL);

            y /= factor;
        }

        this.__autoLockMovement();

        evt.preventDefault();

        this.__addMovement(x, y);
        GLOBAL_TOUCHES.setActiveScrollbar(this);
    });

    this.__addEvent(container, 'touchend blur', () => {
        if (this.__isDrag) return;

        if (!GLOBAL_TOUCHES.isActiveScrollbar(this)) return;

        const { speed } = this.options;

        let { x, y } = GLOBAL_TOUCHES.getVelocity();

        x = movementLocked.x ? 0 : Math.min(x * GLOBAL_ENV.EASING_MULTIPLIER, 1000);
        y = movementLocked.y ? 0 : Math.min(y * GLOBAL_ENV.EASING_MULTIPLIER, 1000);

        this.__addMovement(
            Math.abs(x) > MIN_VELOCITY ? (x * speed) : 0,
            Math.abs(y) > MIN_VELOCITY ? (y * speed) : 0
        );

        this.__unlockMovement();
        GLOBAL_TOUCHES.release(currentTouchID);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true,
});
