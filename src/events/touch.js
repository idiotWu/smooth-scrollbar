/**
 * @module
 * @prototype {Function} __touchHandler
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import {
    getOriginalEvent,
    getPosition,
    getTouchID
} from '../utils/';

export { SmoothScrollbar };

const DEVICE_SCALE = /Android/.test(navigator.userAgent) ? window.devicePixelRatio : 1;
const GLOBAL_TOUCHES = {};

/**
 * @method
 * @internal
 * Touch event handlers builder
 */
let __touchHandler = function() {
    const { options, targets } = this;
    const { container } = targets;

    let originalFriction = options.friction;
    let lastTouchTime, lastTouchID;
    let moveVelocity = {}, lastTouchPos = {};

    let updateRecords = (evt) => {
        const touchList = getOriginalEvent(evt).touches;

        Object.keys(touchList).forEach((key) => {
            // record all touches that will be restored
            const touch = touchList[key];
            const { x, y } = getPosition(touch);
            const record = GLOBAL_TOUCHES[touch.identifier];

            if (record) {
                record.x = x;
                record.y = y;
            } else {
                GLOBAL_TOUCHES[touch.identifier] = { x, y };
            }
        });
    };

    this.__addEvent(container, 'touchstart', (evt) => {
        if (this.__isDrag) return;

        originalFriction = options.friction; // record user option

        updateRecords(evt);

        lastTouchTime = Date.now();
        lastTouchID = getTouchID(evt);
        lastTouchPos = getPosition(evt);

        // stop scrolling
        this.stop();
        moveVelocity.x = moveVelocity.y = 0;
    });

    this.__addEvent(container, 'touchmove', (evt) => {
        if (this.__isDrag) return;

        updateRecords(evt);

        const touchID = getTouchID(evt);

        // check current scrolling scrollbar
        if (GLOBAL_TOUCHES[touchID].activeScrollbar &&
            GLOBAL_TOUCHES[touchID].activeScrollbar !== this) return;

        if (lastTouchID === undefined) {
            // reset last touch info from records
            lastTouchID = touchID;

            // don't need error handler
            lastTouchTime = Date.now();
            lastTouchPos = GLOBAL_TOUCHES[touchID];
        } else if (touchID !== lastTouchID) {
            // prevent multi-touch bouncing
            return;
        }

        if (!lastTouchPos) return;

        const duration = (Date.now() - lastTouchTime) || 1;

        const last = lastTouchPos;
        const current = lastTouchPos = getPosition(evt);

        const disX = last.x - current.x;
        const disY = last.y - current.y;

        moveVelocity.x = disX / duration;
        moveVelocity.y = disY / duration;

        if (options.continuousScrolling &&
            this.__scrollOntoEdge(disX, disY)
        ) {
            return this.__updateThrottle();
        }

        GLOBAL_TOUCHES[touchID].activeScrollbar = this;

        evt.preventDefault();

        options.friction = 40; // change friction temporarily
        this.__addMovement(disX, disY);
    });

    this.__addEvent(container, 'touchend', () => {
        if (this.__isDrag) return;

        // release current touch
        delete GLOBAL_TOUCHES[lastTouchID];
        lastTouchID = undefined;

        options.friction = originalFriction; // set back

        let { x, y } = moveVelocity;

        x *= 1e3;
        y *= 1e3;

        const { speed } = this.options;

        this.__addMovement(
            Math.abs(x) > 5 ? x * speed * DEVICE_SCALE : 0,
            Math.abs(y) > 5 ? y * speed * DEVICE_SCALE : 0
        );

        moveVelocity.x = moveVelocity.y = 0;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});
