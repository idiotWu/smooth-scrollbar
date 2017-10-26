import clamp from 'lodash-es/clamp';
import debounce from 'lodash-es/debounce';
import { ScrollbarPlugin } from 'smooth-scrollbar';
import { Bounce } from './bounce';
import { Glow } from './glow';

export enum OverscrollEffect {
  BOUNCE = 'bounce',
  GLOW = 'glow',
}

export type Data2d = {
  x: number,
  y: number,
};

export type OnScrollCallback = (this: OverscrollPlugin, position: Data2d) => void;

export type OverscrollOptions = {
  effect?: OverscrollEffect,
  onScroll?: OnScrollCallback,
  damping: number,
  maxOverscroll: number,
  glowColor: string,
};

const ALLOWED_EVENTS = /wheel|touch/;

export default class OverscrollPlugin extends ScrollbarPlugin {
  static pluginName = 'overscroll';

  static defaultOptions: OverscrollOptions = {
    effect: OverscrollEffect.BOUNCE,
    onScroll: undefined,
    damping: 0.2,
    maxOverscroll: 150,
    glowColor: '#87ceeb',
  };

  options: OverscrollOptions;

  private _glow = new Glow(this.scrollbar);
  private _bounce = new Bounce(this.scrollbar);

  private _wheelScrollBack = {
    x: false,
    y: false,
  };
  private _lockWheel = {
    x: false,
    y: false,
  };

  private get _isWheelLocked() {
    return this._lockWheel.x || this._lockWheel.y;
  }

  private _touching = false;

  private _lastEventType: string;

  private _amplitude = {
    x: 0,
    y: 0,
  };

  private _position = {
    x: 0,
    y: 0,
  };

  private get _enabled() {
    return !!this.options.effect;
  }

  // since we can't detect whether user release touchpad
  // handle it with debounce is the best solution now, as a trade-off
  private _releaseWheel = debounce(() => {
    this._lockWheel.x = false;
    this._lockWheel.y = false;
  }, 30);

  onInit() {
    const {
      _glow,
      options,
      scrollbar,
    } = this;

    // observe
    let effect = options.effect;

    Object.defineProperty(options, 'effect', {
      get() {
        return effect;
      },
      set(val) {
        if (!val) {
          effect = undefined;
          return;
        }

        if (val !== OverscrollEffect.BOUNCE && val !== OverscrollEffect.GLOW) {
          throw new TypeError(`unknow overscroll effect: ${val}`);
        }

        effect = val;

        scrollbar.options.continuousScrolling = false;

        if (val === OverscrollEffect.GLOW) {
          _glow.mount();
          _glow.adjust();
        } else {
          _glow.unmount();
        }
      },
    });

    options.effect = effect; // init
  }

  onUpdate() {
    if (this.options.effect === OverscrollEffect.GLOW) {
      this._glow.adjust();
    }
  }

  onRender(remainMomentum: Data2d) {
    if (!this._enabled) {
      return;
    }

    if (this.scrollbar.options.continuousScrolling) {
      // turn off continuous scrolling
      this.scrollbar.options.continuousScrolling = false;
    }

    let { x: nextX, y: nextY } = remainMomentum;

    // transfer remain momentum to overscroll
    if (!this._amplitude.x &&
        this._willOverscroll('x', remainMomentum.x)
    ) {
      nextX = 0;

      this._absorbMomentum('x', remainMomentum.x);
    }

    if (!this._amplitude.y &&
        this._willOverscroll('y', remainMomentum.y)
    ) {
      nextY = 0;

      this._absorbMomentum('y', remainMomentum.y);
    }

    this.scrollbar.setMomentum(nextX, nextY);
    this._render();
  }

  transformDelta(delta: Data2d, fromEvent: Event): Data2d {
    this._lastEventType = fromEvent.type;

    if (!this._enabled || !ALLOWED_EVENTS.test(fromEvent.type)) {
      return delta;
    }

    if (this._isWheelLocked && /wheel/.test(fromEvent.type)) {
      this._releaseWheel();

      if (this._willOverscroll('x', delta.x)) {
        delta.x = 0;
      }

      if (this._willOverscroll('y', delta.y)) {
        delta.y = 0;
      }
    }

    let { x: nextX, y: nextY } = delta;

    if (this._willOverscroll('x', delta.x)) {
      nextX = 0;
      this._addAmplitude('x', delta.x);
    }

    if (this._willOverscroll('y', delta.y)) {
      nextY = 0;
      this._addAmplitude('y', delta.y);
    }

    switch (fromEvent.type) {
      case 'touchstart':
      case 'touchmove':
        this._touching = true;
        this._glow.recordTouch(fromEvent as TouchEvent);
        break;

      case 'touchcancel':
      case 'touchend':
        this._touching = false;
        break;
    }

    return {
      x: nextX,
      y: nextY,
    };
  }

  private _willOverscroll(direction: 'x' | 'y', delta: number): boolean {
    if (!delta) {
      return false;
    }

    // away from origin
    if (this._position[direction]) {
      return true;
    }

    const offset = this.scrollbar.offset[direction];
    const limit = this.scrollbar.limit[direction];

    if (limit === 0) {
      return false;
    }

    // cond:
    //  1. next scrolling position is supposed to stay unchange
    //  2. current position is on the edge
    return clamp(offset + delta, 0, limit) === offset &&
        (offset === 0 || offset === limit);
  }

  private _absorbMomentum(direction: 'x' | 'y', remainMomentum: number) {
    const {
      options,
      _lastEventType,
      _amplitude,
    } = this;

    if (!ALLOWED_EVENTS.test(_lastEventType)) {
      return;
    }

    _amplitude[direction] = clamp(remainMomentum, -options.maxOverscroll, options.maxOverscroll);
  }

  private _addAmplitude(direction: 'x' | 'y', delta: number) {
    const {
      options,
      scrollbar,
      _amplitude,
      _position,
    } = this;

    const currentAmp = _amplitude[direction];

    const isOpposite = delta * currentAmp < 0;

    let friction: number;

    if (isOpposite) {
      // opposite direction
      friction = 0;
    } else {
      friction = this._wheelScrollBack[direction] ?
        1 : Math.abs(currentAmp / options.maxOverscroll);
    }

    const amp = currentAmp + delta * (1 - friction);

    _amplitude[direction] = scrollbar.offset[direction] === 0 ?
      /*    top | left  */ clamp(amp, -options.maxOverscroll, 0) :
      /* bottom | right */ clamp(amp, 0, options.maxOverscroll);

    if (isOpposite) {
      // scroll back
      _position[direction] = _amplitude[direction];
    }
  }

  private _render() {
    const {
      options,
      _amplitude,
      _position,
    } = this;

    if (this._enabled &&
        (_amplitude.x || _amplitude.y || _position.x || _position.y)
    ) {
      const nextX = this._nextAmp('x');
      const nextY = this._nextAmp('y');

      _amplitude.x = nextX.amplitude;
      _position.x = nextX.position;

      _amplitude.y = nextY.amplitude;
      _position.y = nextY.position;

      switch (options.effect) {
        case OverscrollEffect.BOUNCE:
          this._bounce.render(_position);
          break;

        case OverscrollEffect.GLOW:
          this._glow.render(_position, this.options.glowColor);
          break;
      }

      if (typeof options.onScroll === 'function') {
        options.onScroll.call(this, { ..._position });
      }
    }
  }

  private _nextAmp(direction: 'x' | 'y'): { amplitude: number, position: number } {
    const {
      options,
      _amplitude,
      _position,
    } = this;

    const t = 1 - options.damping;
    const amp = _amplitude[direction];
    const pos = _position[direction];

    const nextAmp = this._touching ? amp : (amp * t | 0);
    const distance = nextAmp - pos;
    const nextPos = pos + distance - (distance * t | 0);

    if (!this._touching && Math.abs(nextPos) < Math.abs(pos)) {
      this._wheelScrollBack[direction] = true;
    }

    if (this._wheelScrollBack[direction] && Math.abs(nextPos) <= 1) {
      this._wheelScrollBack[direction] = false;
      this._lockWheel[direction] = true;
    }

    return {
      amplitude: nextAmp,
      position: nextPos,
    };
  }
}
