/**
 * @module
 * @prototype {Function} __touchHandler
 * @dependencies [ SmoothScrollbar, #scrollTo, #setPosition, getOriginalEvent, getPosition, getTouchID, pickInRange ]
 */

import '../apis/scroll_to';
import '../apis/set_position';
import { SmoothScrollbar } from '../smooth_scrollbar';
import { getOriginalEvent, getPosition, getTouchID, pickInRange } from '../utils/index';

export { SmoothScrollbar };

/**
 * @method
 * @internal
 * Touch event handlers builder,
 * include `touchstart`, `touchmove` and `touchend`
 *
 * @param {Object} option
 *
 * @return {Object}: a set of event handlers
 */
let __touchHandler = function({ easingDuration }) {
    let { container } = this.targets;

    let lastTouchTime, lastTouchID;
    let moveVelocity = {}, lastTouchPos = {}, touchRecords = {};

    let updateRecords = (evt) => {
        let touchList = getOriginalEvent(evt).touches;

        Object.keys(touchList).forEach((key) => {
            // record all touches that will be restored
            if (key === 'length') return;

            let touch = touchList[key];

            touchRecords[touch.identifier] = getPosition(touch);
        });
    };

    this.$on('touchstart', container, (evt) => {
        cancelAnimationFrame(this.scrollAnimation);
        updateRecords(evt);

        lastTouchID = getTouchID(evt);
        lastTouchPos = getPosition(evt);
        lastTouchTime = (new Date()).getTime();
        moveVelocity.x = moveVelocity.y = 0;
    });

    this.$on('touchmove', container, (evt) => {
        if (this.__fromChild(evt)) return;

        updateRecords(evt);

        let touchID = getTouchID(evt);
        let { offset, limit } = this;

        if (lastTouchID === undefined) {
            // reset last touch info from records
            lastTouchID = touchID;

            // don't need error handler
            lastTouchPos = touchRecords[touchID];
            lastTouchTime = (new Date()).getTime();
        } else if (touchID !== lastTouchID) {
            // prevent multi-touch bouncing
            return;
        }

        if (!lastTouchPos) return;

        let duration = (new Date()).getTime() - lastTouchTime;
        let { x: lastX, y: lastY } = lastTouchPos;
        let { x: curX, y: curY } = lastTouchPos = getPosition(evt);

        duration = duration || 1; // fix Infinity error

        moveVelocity.x = (lastX - curX) / duration;
        moveVelocity.y = (lastY - curY) / duration;

        let destX = pickInRange(lastX - curX + offset.x, 0, limit.x);
        let destY = pickInRange(lastY - curY + offset.y, 0, limit.y);

        if (Math.abs(destX - offset.x) < 1 && Math.abs(destY - offset.y) < 1) {
            return this.__updateThrottle();
        }

        evt.preventDefault();

        // don't need easing too
        this.setPosition(destX, destY);
    });

    this.$on('touchend', container, (evt) => {
        if (this.__fromChild(evt)) return;

        // release current touch
        delete touchRecords[lastTouchID];
        lastTouchID = undefined;

        let { x, y } = moveVelocity;
        let threshold = 10 / 1e3; // 10 px/s

        if (Math.abs(x) > threshold ||
            Math.abs(y) > threshold) {
            this.scrollTo(
                x * easingDuration + this.offset.x,
                y * easingDuration + this.offset.y,
                easingDuration
            );
        }

        moveVelocity.x = moveVelocity.y = 0;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__touchHandler', {
    value: __touchHandler,
    writable: true,
    configurable: true
});
