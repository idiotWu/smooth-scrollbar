/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { GLOBAL_TOUCHES } from '../shared/';

export { SmoothScrollbar };

const MIN_VELOCITY = 100;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
let __touchHandler = function() {
    const { targets, movementLocked } = this;
    const { container } = targets;

    this.__addEvent(container, 'touchstart', (evt) => {
        if (this.__isDrag) return;

        // stop scrolling
        this.stop();
        GLOBAL_TOUCHES.start(evt);
    });

    this.__addEvent(container, 'touchmove', (evt) => {
        if (this.__isDrag) return;

        if (!GLOBAL_TOUCHES.isActiveTouch(evt)) return;

        if (GLOBAL_TOUCHES.hasActiveScrollbar() &&
            !GLOBAL_TOUCHES.isActiveScrollbar(this)) return;

        const delta = GLOBAL_TOUCHES.update(evt);

        if (this.__propagateMovement(delta.x, delta.y)) {
            return this.__updateThrottle();
        }

        if (this.__isOntoEdge('x', delta.x)) delta.x /= 2;
        if (this.__isOntoEdge('y', delta.y)) delta.y /= 2;

        this.__autoLockMovement();

        evt.preventDefault();

        this.__addMovement(delta.x, delta.y);
        GLOBAL_TOUCHES.setActiveScrollbar(this);
    });

    this.__addEvent(container, 'touchend blur', () => {
        if (this.__isDrag) return;

        if (!GLOBAL_TOUCHES.isActiveScrollbar(this)) return;

        const { speed } = this.options;

        let { x, y } = GLOBAL_TOUCHES.getVelocity();

        x = movementLocked.x ?
                0 : x / Math.abs(x) * Math.sqrt(Math.abs(x) * 100);
        y = movementLocked.y ?
                0 : y / Math.abs(y) * Math.sqrt(Math.abs(y) * 100);

        this.__addMovement(
            Math.abs(x) > MIN_VELOCITY ? (x * speed) : 0,
            Math.abs(y) > MIN_VELOCITY ? (y * speed) : 0
        );

        this.__unlockMovement();
        GLOBAL_TOUCHES.release();
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});
