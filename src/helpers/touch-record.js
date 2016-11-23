import { toArray } from './to-array';

import { getPointerPosition } from './get-pointer-position';

class Tracker {
    constructor(touch, prevTracker) {
        this.next = null;
        this.prev = null;

        this.updateTime = Date.now();
        this.delta = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastPosition = getPointerPosition(touch);

        if (prevTracker) {
            this.setPrev(prevTracker);
            prevTracker.setNext(this);
        }
    }

    update(touch) {
        const {
            velocity,
            updateTime,
            lastPosition,
        } = this;

        const now = Date.now();
        const position = getPointerPosition(touch);

        const delta = {
            x: -(position.x - lastPosition.x),
            y: -(position.y - lastPosition.y),
        };

        const duration = (now - updateTime) || 16;
        const vx = delta.x / duration * 1e3;
        const vy = delta.y / duration * 1e3;
        velocity.x = vx * 0.8 + velocity.x * 0.2;
        velocity.y = vy * 0.8 + velocity.y * 0.2;

        this.delta = delta;
        this.updateTime = now;
        this.lastPosition = position;
    }

    setNext(tracker) {
        this.next = tracker;
    }

    setPrev(tracker) {
        this.prev = tracker;
    }
}

export class TouchRecord {
    constructor() {
        this.touchList = {};
        this.lastTouch = null;
        this.activeTouch = null;
    }

    get _primitiveValue() {
        return { x: 0, y: 0 };
    }

    _getTracker(touch) {
        return this.touchList[touch.identifier];
    }

    _add(touch) {
        const tracker = new Tracker(touch, this.activeTouch);

        this.lastTouch = this.activeTouch;
        this.activeTouch = tracker;

        this.touchList[touch.identifier] = tracker;
    }

    _remove(touch) {
        const tracker = this._getTracker(touch);

        if (!tracker) {
            return;
        }

        if (tracker === this.activeTouch) {
            this.activeTouch = tracker.prev;
        }

        if (tracker.next) {
            tracker.next.setPrev(tracker.prev);
        }

        if (tracker.prev) {
            tracker.prev.setNext(tracker.next);
        }

        this.lastTouch = tracker;
        delete this.touchList[touch.identifier];
    }

    _renew(touch) {
        const tracker = this._getTracker(touch);

        if (!tracker) {
            return;
        }

        tracker.update(touch);
    }

    isActive() {
        return this.activeTouch !== null;
    }

    track(evt) {
        const {
            changedTouches,
        } = evt;

        toArray(changedTouches).forEach(::this._add);
    }

    update(evt) {
        const {
            changedTouches,
        } = evt;

        toArray(changedTouches).forEach(::this._renew);
    }

    release(evt) {
        const {
            changedTouches,
        } = evt;

        toArray(changedTouches).forEach(::this._remove);
    }

    updatedRecently() {
        const tracker = this.activeTouch;

        return tracker && Date.now() - tracker.updateTime < 30;
    }

    _getPosition(tracker, coord = '') {
        const position = tracker ? tracker.lastPosition : this._primitiveValue;

        if (!coord) return { ...position };

        return position[coord] || 0;
    }
    getCurrentPosition(coord = '') {
        return this._getPosition(this.activeTouch, coord);
    }
    getLastPosition(coord = '') {
        return this._getPosition(this.lastTouch, coord);
    }

    _getVelocity(tracker) {
        if (!tracker) {
            return this._primitiveValue;
        }

        return { ...tracker.velocity };
    }
    getCurrentVelocity() {
        return this._getVelocity(this.activeTouch);
    }
    getLastVelocity() {
        return this._getVelocity(this.lastTouch);
    }

    _getDelta(tracker) {
        if (!tracker) {
            return this._primitiveValue;
        }

        return { ...tracker.delta };
    }
    getCurrentDelta() {
        return this._getDelta(this.activeTouch);
    }
    getLastDelta() {
        return this._getDelta(this.lastTouch);
    }
}
