/**
 * @module
 * @export {Class} TouchRecord
 */

import { getPosition } from './get_position';
import { getTouchID } from './get_touch_id';

const TOUCH_SUPPORTED = 'ontouchstart' in document;

export class TouchRecord {
    constructor() {
        this.init();
        this.lastRecord = {};
    }

    get TOUCH_SUPPORTED() {
        return TOUCH_SUPPORTED;
    }

    init() {
        this.velocity = {};
        this.startPosition = {};
        this.activeID = undefined;
        this.updateTime = undefined;
        this.activeScrollbar = null;
    }

    isActiveTouch(eventOrID) {
        if (this.activeID === undefined) return true;

        const id = typeof eventOrID === 'number' ? eventOrID : getTouchID(eventOrID);

        return this.activeID === id;
    }

    isActiveScrollbar(scrollbar) {
        return this.activeScrollbar === scrollbar;
    }

    hasActiveScrollbar() {
        return !!this.activeScrollbar;
    }

    setActiveScrollbar(scrollbar) {
        this.activeScrollbar = scrollbar;
    }

    getVelocity() {
        return this.velocity;
    }

    release(id) {
        if (this.isActiveTouch(id)) this.init();
    }

    start(evt) {
        this.init();
        this.update(evt);
        this.activeID = getTouchID(evt);
        this.startPosition = getPosition(evt);

        return this.activeID;
    }

    update(evt) {
        if (!this.isActiveTouch(evt)) {
            return { x: 0, y: 0 };
        }

        const now = Date.now();
        const position = getPosition(evt);

        const { velocity, lastRecord } = this;

        const duration = now - this.updateTime;
        const delta = {
            // natural scrolling
            x: -(position.x - lastRecord.x),
            y: -(position.y - lastRecord.y)
        };

        velocity.x = delta.x / duration * 1e3;
        velocity.y = delta.y / duration * 1e3;

        this.updateTime = now;
        this.lastRecord = position;

        return delta;
    }

    getLastRecord(which = '') {
        const { lastRecord } = this;

        if (!which) {
            return lastRecord.hasOwnProperty('x') ? { ...lastRecord } : {};
        }

        return lastRecord[which];
    }

    updatedRecentlly() {
        return Date.now() - (this.updateTime || 0) < 30;
    }
}