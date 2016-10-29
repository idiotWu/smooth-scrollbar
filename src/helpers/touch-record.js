import { getPointerPosition } from './get-pointer-position';

class Tracker {
    constructor(touch) {
        this.updateTime = Date.now();
        this.delta = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastPosition = getPointerPosition(touch);
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
}

export class TouchRecord {
    constructor() {
        this.touchList = {};
        this.lastTouch = null;
        this.activeTouchID = undefined;
    }

    get primitiveValue() {
        return { x: 0, y: 0 };
    }

    add(touch) {
        if (this.has(touch)) return null;

        const tracker = new Tracker(touch);

        this.touchList[touch.identifier] = tracker;

        return tracker;
    }

    renew(touch) {
        if (!this.has(touch)) return null;

        const tracker = this.touchList[touch.identifier];

        tracker.update(touch);

        return tracker;
    }

    delete(touch) {
        return delete this.touchList[touch.identifier];
    }

    has(touch) {
        return this.touchList.hasOwnProperty(touch.identifier);
    }

    setActiveID(touches) {
        this.activeTouchID = touches[touches.length - 1].identifier;
        this.lastTouch = this.touchList[this.activeTouchID];
    }

    getActiveTracker() {
        const {
            touchList,
            activeTouchID,
        } = this;

        return touchList[activeTouchID];
    }

    isActive() {
        return this.activeTouchID !== undefined;
    }

    getDelta() {
        const tracker = this.getActiveTracker();

        if (!tracker) {
            return this.primitiveValue;
        }

        return { ...tracker.delta };
    }

    getVelocity() {
        const tracker = this.getActiveTracker();

        if (!tracker) {
            return this.primitiveValue;
        }

        return { ...tracker.velocity };
    }

    getLastPosition(coord = '') {
        const tracker = this.getActiveTracker() || this.lastTouch;

        const position = tracker ? tracker.lastPosition : this.primitiveValue;

        if (!coord) return { ...position };

        if (!position.hasOwnProperty(coord)) return 0;

        return position[coord];
    }

    updatedRecently() {
        const tracker = this.getActiveTracker();

        return tracker && Date.now() - tracker.updateTime < 30;
    }

    track(evt) {
        const {
            targetTouches,
        } = evt;

        [...targetTouches].forEach(touch => {
            this.add(touch);
        });

        return this.touchList;
    }

    update(evt) {
        const {
            touches,
            changedTouches,
        } = evt;

        [...touches].forEach(touch => {
            this.renew(touch);
        });

        this.setActiveID(changedTouches);

        return this.touchList;
    }

    release(evt) {
        this.activeTouchID = undefined;

        [...evt.changedTouches].forEach(touch => {
            this.delete(touch);
        });

        return this.touchList;
    }
}
