/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import {
    getOriginalEvent,
    getPosition,
    getTouchID,
    pickInRange
} from '../utils/index';

export { SmoothScrollbar };

const EASING_DURATION = navigator.userAgent.match(/android/i) ? 1500 : 750;

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
let __touchHandler = function() {
    const { container } = this.targets;

    let lastTouchTime, lastTouchID;
    let moveVelocity = {}, lastTouchPos = {}, touchRecords = {};

    let updateRecords = (evt) => {
        const touchList = getOriginalEvent(evt).touches;

        Object.keys(touchList).forEach((key) => {
            // record all touches that will be restored
            if (key === 'length') return;

            const touch = touchList[key];

            touchRecords[touch.identifier] = getPosition(touch);
        });
    };

    this.__addEvent(container, 'touchstart', (evt) => {
        if (this.__isDrag) return;

        const { movement } = this;

        updateRecords(evt);

        lastTouchTime = Date.now();
        lastTouchID = getTouchID(evt);
        lastTouchPos = getPosition(evt);

        // stop scrolling
        movement.x = movement.y = 0;
        moveVelocity.x = moveVelocity.y = 0;
    });

    this.__addEvent(container, 'touchmove', (evt) => {
        if (this.__ignoreEvent(evt) || this.__isDrag) return;

        updateRecords(evt);

        const touchID = getTouchID(evt);
        const { offset, limit } = this;

        if (lastTouchID === undefined) {
            // reset last touch info from records
            lastTouchID = touchID;

            // don't need error handler
            lastTouchTime = Date.now();
            lastTouchPos = touchRecords[touchID];
        } else if (touchID !== lastTouchID) {
            // prevent multi-touch bouncing
            return;
        }

        if (!lastTouchPos) return;

        evt.preventDefault();

        let duration = Date.now() - lastTouchTime;
        let { x: lastX, y: lastY } = lastTouchPos;
        let { x: curX, y: curY } = lastTouchPos = getPosition(evt);

        duration = duration || 1; // fix Infinity error

        moveVelocity.x = (lastX - curX) / duration;
        moveVelocity.y = (lastY - curY) / duration;

        let destX = pickInRange(lastX - curX + offset.x, 0, limit.x);
        let destY = pickInRange(lastY - curY + offset.y, 0, limit.y);

        this.setPosition(destX, destY);
    });

    this.__addEvent(container, 'touchend', (evt) => {
        if (this.__ignoreEvent(evt) || this.__isDrag) return;

        // release current touch
        delete touchRecords[lastTouchID];
        lastTouchID = undefined;

        let { x, y } = moveVelocity;

        this.__setMovement(
            x ? x / Math.abs(x) * Math.sqrt(Math.abs(x) * 1e3) * 20 : 0,
            y ? y / Math.abs(y) * Math.sqrt(Math.abs(y) * 1e3) * 20 : 0
        );

        moveVelocity.x = moveVelocity.y = 0;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});
