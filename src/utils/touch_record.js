/**
 * @module
 * @export {Class} TouchRecord
 */

import { getPosition } from './get_position';
import { getTouchID } from './get_touch_id';

export class TouchRecord {
    constructor() {
        this.init();
        this.lastRecord = {};
    }

    init() {
        this.velocity = {};
        this.startPosition = {};
        this.activeID = undefined;
        this.updateTime = undefined;
        this.activeScrollbar = null;
    }

    isActiveTouch(evt) {
        if (this.activeID === undefined) return true;

        return this.activeID === getTouchID(evt);
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

    release() {
        this.init();
    }

    start(evt) {
        this.init();
        this.update(evt);
        this.activeID = getTouchID(evt);
        this.startPosition = getPosition(evt);
    }

    update(evt) {
        const now = Date.now();
        const touchID = getTouchID(evt);
        const position = getPosition(evt);

        if (this.activeID === undefined) {
            this.activeID = touchID;
            this.updateTime = now;
            this.lastRecord = position;

            return { x: 0, y: 0 };
        }

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
}