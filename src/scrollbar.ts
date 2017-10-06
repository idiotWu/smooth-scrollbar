import { Options } from './options';

import {
  setStyle,
  clearEventsOn,
} from './utils/';

import {
  debounce,
} from './decorators/';

import {
  TrackController,
} from './track/';

import {
  getSize,
  update,
  isVisible,
} from './metrics/';

import {
  scrollTo,
  setPosition,
  scrollIntoView,
} from './scrolling/';

import {
  GLOBAL_ENV,
  scrollbarMap,
} from './shared/';

import {
  initPlugins,
} from './plugin';

import {
  attachStyle,
} from './style';

import * as eventHandlers from './events/';

import * as I from './interfaces/';

export class Scrollbar implements I.Scrollbar {
  readonly options: I.ScrollbarOptions;

  readonly containerEl: HTMLElement;
  readonly contentEl: HTMLElement;

  readonly track: TrackController;

  size: I.ScrollbarSize;

  offset = {
    x: 0,
    y: 0,
  };

  limit = {
    x: Infinity,
    y: Infinity,
  };

  bounding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  get scrollTop() {
    return this.offset.y;
  }
  set scrollTop(y: number) {
    this.setPosition(this.scrollLeft, y);
  }

  get scrollLeft() {
    return this.offset.x;
  }
  set scrollLeft(x: number) {
    this.setPosition(x, this.scrollTop);
  }

  private _renderID: number;
  private _observer: MutationObserver;
  private _plugins: I.ScrollbarPlugin[];

  private _momentum = { x: 0, y: 0 };
  private _listeners = new Set<I.ScrollListener>();

  constructor(
    containerEl: HTMLElement,
    options?: Partial<I.ScrollbarOptions>,
  ) {
    this.containerEl = containerEl;
    const contentEl = this.contentEl = document.createElement('div');

    this.options = new Options(options);

    // attach stylesheet
    attachStyle();

    // mark as a scroll element
    containerEl.setAttribute('data-scrollbar', 'true');

    // reset scroll position
    containerEl.scrollTop = containerEl.scrollLeft = 0;

    // make container focusable
    containerEl.setAttribute('tabindex', '1');
    setStyle(containerEl, {
      overflow: 'hidden',
      outline: 'none',
    });

    // mount content
    contentEl.className = 'scroll-content';

    Array.from(containerEl.childNodes).forEach((node) => {
      contentEl.appendChild(node);
    });

    containerEl.appendChild(contentEl);

    // attach track
    this.track = new TrackController(this);

    // initial measuring
    this.size = this.getSize();

    // init plugins
    this._plugins = initPlugins(this);

    // observe
    if (typeof GLOBAL_ENV.MutationObserver === 'function') {
      this._observer = new GLOBAL_ENV.MutationObserver(() => {
        this.update();
      });

      this._observer.observe(contentEl, {
        childList: true,
      });
    }

    scrollbarMap.set(containerEl, this);

    // wait for DOM ready
    requestAnimationFrame(() => {
      this._init();
    });
  }

  getSize(): I.ScrollbarSize {
    return getSize(this);
  }

  update() {
    update(this);
  }

  isVisible(elem: HTMLElement): boolean {
    return isVisible(this, elem);
  }

  setPosition(
    x = this.offset.x,
    y = this.offset.y,
    options: I.SetPositionOptions = {},
  ) {
    // position changed -> show track for 300ms
    if (x !== this.offset.x) this.track.xAxis.show();
    if (y !== this.offset.y) this.track.yAxis.show();
    if (!this.options.alwaysShowTracks) {
      this._hideTrackDebounced();
    }

    const status = setPosition(this, x, y);

    if (!status || options.withoutCallbacks) {
      return;
    }

    this._listeners.forEach((fn) => {
      fn.call(this, status);
    });
  }

  scrollTo(
    x = this.offset.x,
    y = this.offset.y,
    duration = 0,
    options: I.ScrollToOptions = {},
  ) {
    scrollTo(this, x, y, duration, options);
  }

  scrollIntoView(
    elem: HTMLElement,
    options: I.ScrollIntoViewOptions = {},
  ) {
    scrollIntoView(this, elem, options);
  }

  addListener(fn: I.ScrollListener) {
    this._listeners.add(fn);
  }

  removeListener(fn: I.ScrollListener) {
    this._listeners.delete(fn);
  }

  addMomentum(x: number, y: number, fromEvent: Event) {
    this._updateDebounced();

    if (this.limit.x === 0) {
      x = 0;
    }
    if (this.limit.y === 0) {
      y = 0;
    }

    const finalDelta = this._plugins.reduce((delta, plugin) => {
      return plugin.transformDelta(delta, fromEvent) || delta;
    }, { x, y });

    let deltaX = this._momentum.x + finalDelta.x;
    let deltaY = this._momentum.y + finalDelta.y;

    if (this.options.renderByPixels) {
      // ensure resolved with integer
      deltaX = Math.round(deltaX);
      deltaY = Math.round(deltaY);
    }

    this._momentum.x = deltaX;
    this._momentum.y = deltaY;
  }

  setMomentum(x: number, y: number) {
    this._updateDebounced();

    if (this.limit.x === 0) {
      x = 0;
    }
    if (this.limit.y === 0) {
      y = 0;
    }

    if (this.options.renderByPixels) {
      x = Math.round(x);
      y = Math.round(y);
    }

    this._momentum.x = x;
    this._momentum.y = y;
  }

  destroy() {
    const {
      containerEl,
      contentEl,
    } = this;

    clearEventsOn(this);
    this._listeners.clear();

    this.setMomentum(0, 0);
    cancelAnimationFrame(this._renderID);

    if (this._observer) {
      this._observer.disconnect();
    }

    scrollbarMap.delete(this.containerEl);

    // restore contents
    const childNodes = Array.from(contentEl.childNodes);

    while (containerEl.firstChild) {
      containerEl.removeChild(containerEl.firstChild);
    }

    childNodes.forEach((el) => {
      containerEl.appendChild(el);
    });

    // reset scroll position
    setStyle(contentEl, {
      overflow: '',
    });
    containerEl.scrollTop = this.scrollTop;
    containerEl.scrollLeft = this.scrollLeft;

    // invoke plugin.onDestory
    this._plugins.forEach((plugin) => {
      plugin.onDestory();
    });
    this._plugins.length = 0;
  }

  private _init() {
    // init metrics
    this.update();

    // init evet handlers
    Object.keys(eventHandlers).forEach((prop) => {
      eventHandlers[prop](this);
    });

    // invoke `plugin.onInit`
    this._plugins.forEach((plugin) => {
      plugin.onInit();
    });

    this._render();
  }

  @debounce(100, { leading: true })
  private _updateDebounced() {
    this.update();
  }

  @debounce(300)
  private _hideTrackDebounced() {
    this.track.xAxis.hide();
    this.track.yAxis.hide();
  }

  private _render() {
    const {
      _momentum,
    } = this;

    if (_momentum.x || _momentum.y) {
      const nextX = this._nextTick('x');
      const nextY = this._nextTick('y');

      _momentum.x = nextX.momentum;
      _momentum.y = nextY.momentum;

      this.setPosition(nextX.position, nextY.position);
    }

    this._renderID = requestAnimationFrame(this._render.bind(this));
  }

  private _nextTick(direction: 'x' | 'y'): { momentum: number, position: number } {
    const {
      options,
      offset,
      _momentum,
    } = this;

    const current = offset[direction];
    const remain = _momentum[direction];

    if (Math.abs(remain) <= 1) {
      return {
        momentum: 0,
        position: current + remain,
      };
    }

    let nextMomentum = remain * (1 - options.damping);

    if (options.renderByPixels) {
      nextMomentum |= 0;
    }

    return {
      momentum: nextMomentum,
      position: current + remain - nextMomentum,
    };
  }
}
