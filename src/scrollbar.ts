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
} from './geometry/';

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

import * as eventHandlers from './events/';

import * as I from './interfaces/';

export class Scrollbar implements I.Scrollbar {
  readonly options: I.ScrollbarOptions;

  readonly containerEl: HTMLElement;
  readonly contentEl: HTMLDivElement;

  readonly track: I.TrackController;

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
  private _plugins: I.ScrollbarPlugin[] = [];

  private _momentum = { x: 0, y: 0 };
  private _listeners = new Set<I.ScrollListener>();

  constructor(
    containerEl: HTMLElement,
    options?: Partial<I.ScrollbarOptions>,
  ) {
    this.containerEl = containerEl;
    const contentEl = this.contentEl = document.createElement('div');

    this.options = new Options(options);

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

    // enable touch event capturing in IE, see:
    // https://github.com/idiotWu/smooth-scrollbar/issues/39
    if (window.navigator.msPointerEnabled) {
      containerEl.style.msTouchAction = 'none';
    }

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
    this._lazyInitPlugins();

    // observe
    if (typeof GLOBAL_ENV.MutationObserver === 'function') {
      this._observer = new GLOBAL_ENV.MutationObserver(() => {
        this.update();
      });

      this._observer.observe(contentEl, {
        subtree: true,
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

    this._plugins.forEach((plugin) => {
      plugin.onUpdate();
    });
  }

  isVisible(elem: HTMLElement): boolean {
    return isVisible(this, elem);
  }

  setPosition(
    x = this.offset.x,
    y = this.offset.y,
    options: Partial<I.SetPositionOptions> = {},
  ) {
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
    options: Partial<I.ScrollToOptions> = {},
  ) {
    scrollTo(this, x, y, duration, options);
  }

  scrollIntoView(
    elem: HTMLElement,
    options: Partial<I.ScrollIntoViewOptions> = {},
  ) {
    scrollIntoView(this, elem, options);
  }

  addListener(fn: I.ScrollListener) {
    this._listeners.add(fn);
  }

  removeListener(fn: I.ScrollListener) {
    this._listeners.delete(fn);
  }

  addTransformableMomentum(x: number, y: number, fromEvent: Event) {
    const finalDelta = this._plugins.reduce((delta, plugin) => {
      return plugin.transformDelta(delta, fromEvent) || delta;
    }, { x, y });

    this.addMomentum(finalDelta.x, finalDelta.y);
  }

  addMomentum(x: number, y: number) {
    this.setMomentum(
      this._momentum.x + x,
      this._momentum.y + y,
    );
  }

  setMomentum(x: number, y: number) {
    if (this.limit.x === 0) {
      x = 0;
    }
    if (this.limit.y === 0) {
      y = 0;
    }

    if (x === this._momentum.x && y === this._momentum.y) {
      return;
    }

    this._updateDebounced();

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

  private _lazyInitPlugins() {
    requestAnimationFrame(() => {
      this._plugins = initPlugins(this, this.options.plugins);
    });
  }

  @debounce(100, { leading: true })
  private _updateDebounced() {
    this.update();
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

    const remain = { ...this._momentum };

    this._plugins.forEach((plugin) => {
      plugin.onRender(remain);
    });

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
