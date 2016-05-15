/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { GLOBAL_TOUCHES } from '../shared/';

export { SmoothScrollbar };

const DEVICE_SCALE = /Android/.test(navigator.userAgent) ? window.devicePixelRatio : 1;
const MIN_VELOCITY = Math.E * 100;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
let __touchHandler = function() {
    const { options, targets } = this;
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

        const distance = GLOBAL_TOUCHES.update(evt);

        if (options.continuousScrolling &&
            this.__scrollOntoEdge(distance.x, distance.y)
        ) {
            return this.__updateThrottle();
        }

        evt.preventDefault();

        this.__addMovement(distance.x, distance.y);
        GLOBAL_TOUCHES.setActiveScrollbar(this);
    });

    this.__addEvent(container, 'touchend blur', () => {
        if (this.__isDrag) return;

        if (!GLOBAL_TOUCHES.isActiveScrollbar(this)) return;

        const { speed } = this.options;

        let { x, y } = GLOBAL_TOUCHES.getVelocity();

        x = x / Math.abs(x) * Math.sqrt(Math.abs(x) * DEVICE_SCALE * 100);
        y = y / Math.abs(y) * Math.sqrt(Math.abs(y) * DEVICE_SCALE * 100);

        this.__addMovement(
            Math.abs(x) > MIN_VELOCITY ? (x * speed) : 0,
            Math.abs(y) > MIN_VELOCITY ? (y * speed) : 0
        );

        GLOBAL_TOUCHES.release();
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});
