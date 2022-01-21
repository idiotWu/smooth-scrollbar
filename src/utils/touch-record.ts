import { getPosition } from './get-position';

export class Tracker {
  readonly velocityMultiplier = /Android/.test(navigator.userAgent) ? window.devicePixelRatio : 1;

  updateTime = Date.now();
  delta = { x: 0, y: 0 };
  velocity = { x: 0, y: 0 };
  lastPosition = { x: 0, y: 0 };

  constructor(touch: Touch) {
    this.lastPosition = getPosition(touch);
  }

  update(touch: Touch) {
    const {
      velocity,
      updateTime,
      lastPosition,
    } = this;

    const now = Date.now();
    const position = getPosition(touch);

    const delta = {
      x: -(position.x - lastPosition.x),
      y: -(position.y - lastPosition.y),
    };

    const duration = (now - updateTime) || 16.7;
    const vx = delta.x / duration * 16.7;
    const vy = delta.y / duration * 16.7;
    velocity.x = vx * this.velocityMultiplier;
    velocity.y = vy * this.velocityMultiplier;

    this.delta = delta;
    this.updateTime = now;
    this.lastPosition = position;
  }
}

export class TouchRecord {
  private _activeTouchID: number;
  private _touchList: { [id: number]: Tracker } = {};

  private get _primitiveValue() {
    return { x: 0, y: 0 };
  }

  isActive() {
    return this._activeTouchID !== undefined;
  }

  getDelta() {
    const tracker = this._getActiveTracker();

    if (!tracker) {
      return this._primitiveValue;
    }

    return { ...tracker.delta };
  }

  getVelocity() {
    const tracker = this._getActiveTracker();

    if (!tracker) {
      return this._primitiveValue;
    }

    return { ...tracker.velocity };
  }

  getEasingDistance(damping: number) {
    const deAcceleration = 1 - damping;

    let distance = {
      x: 0,
      y: 0,
    };

    const vel = this.getVelocity();

    Object.keys(vel).forEach(dir => {
      // ignore small velocity
      let v = Math.abs(vel[dir]) <= 10 ? 0 : vel[dir];

      while (v !== 0) {
        distance[dir] += v;
        v = (v * deAcceleration) | 0;
      }
    });

    return distance;
  }

  track(evt: TouchEvent) {
    const {
      targetTouches,
    } = evt;

    Array.from(targetTouches).forEach(touch => {
      this._add(touch);
    });

    return this._touchList;
  }

  update(evt: TouchEvent) {
    const {
      touches,
      changedTouches,
    } = evt;

    Array.from(touches).forEach(touch => {
      this._renew(touch);
    });

    this._setActiveID(changedTouches);

    return this._touchList;
  }

  release(evt: TouchEvent) {
    delete this._activeTouchID;

    Array.from(evt.changedTouches).forEach(touch => {
      this._delete(touch);
    });
  }

  private _add(touch: Touch) {
    if (this._has(touch)) {
      // reset tracker
      this._delete(touch);
    }

    const tracker = new Tracker(touch);

    this._touchList[touch.identifier] = tracker;
  }

  private _renew(touch: Touch) {
    if (!this._has(touch)) {
      return;
    }

    const tracker = this._touchList[touch.identifier];

    tracker.update(touch);
  }

  private _delete(touch: Touch) {
    delete this._touchList[touch.identifier];
  }

  private _has(touch: Touch): boolean {
    return this._touchList.hasOwnProperty(touch.identifier);
  }

  private _setActiveID(touches: TouchList) {
    this._activeTouchID = touches[touches.length - 1].identifier;
  }

  private _getActiveTracker(): Tracker {
    const {
      _touchList,
      _activeTouchID,
    } = this;

    return _touchList[_activeTouchID];
  }
}
