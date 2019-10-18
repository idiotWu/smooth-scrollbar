import clamp from 'lodash-es/clamp';

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
  initPlugins,
} from './plugin';

import * as eventHandlers from './events/';

import * as I from './interfaces/';

// DO NOT use WeakMap here
// .getAll() methods requires `scrollbarMap.values()`
export const scrollbarMap = new Map<HTMLElement, Scrollbar>();

export class Scrollbar implements I.Scrollbar {
  /**
   * Options for current scrollbar instancs
   */
  readonly options: Options;

  readonly track: TrackController;

  /**
   * The element that you initialized scrollbar to
   */
  readonly containerEl: HTMLElement;

  /**
   * The wrapper element that contains your contents
   */
  readonly contentEl: HTMLElement;

  /**
   * Geometry infomation for current scrollbar instance
   */
  size: I.ScrollbarSize;

  /**
   * Current scrolling offsets
   */
  offset = {
    x: 0,
    y: 0,
  };

  /**
   * Max-allowed scrolling offsets
   */
  limit = {
    x: Infinity,
    y: Infinity,
  };

  /**
   * Container bounding rect
   */
  bounding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  /**
   * Parent scrollbar
   */
  get parent() {
    let elem = this.containerEl.parentElement;

    while (elem) {
      const parentScrollbar = scrollbarMap.get(elem);

      if (parentScrollbar) {
        return parentScrollbar;
      }

      elem = elem.parentElement;
    }

    return null;
  }

  /**
   * Gets or sets `scrollbar.offset.y`
   */
  get scrollTop() {
    return this.offset.y;
  }
  set scrollTop(y: number) {
    this.setPosition(this.scrollLeft, y);
  }

  /**
   * Gets or sets `scrollbar.offset.x`
   */
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

    // make container focusable
    containerEl.setAttribute('tabindex', '-1');
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
    this._plugins = initPlugins(this, this.options.plugins);

    // preserve scroll offset
    const { scrollLeft, scrollTop } = containerEl;
    containerEl.scrollLeft = containerEl.scrollTop = 0;
    this.setPosition(scrollLeft, scrollTop, {
      withoutCallbacks: true,
    });

    const global: any = window;
    const MutationObserver = global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;

    // observe
    if (typeof MutationObserver === 'function') {
      this._observer = new MutationObserver(() => {
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

  /**
   * Returns the size of the scrollbar container element
   * and the content wrapper element
   */
  getSize(): I.ScrollbarSize {
    return getSize(this);
  }

  /**
   * Forces scrollbar to update geometry infomation.
   *
   * By default, scrollbars are automatically updated with `100ms` debounce (or `MutationObserver` fires).
   * You can call this method to force an update when you modified contents
   */
  update() {
    update(this);

    this._plugins.forEach((plugin) => {
      plugin.onUpdate();
    });
  }

  /**
   * Checks if an element is visible in the current view area
   */
  isVisible(elem: HTMLElement): boolean {
    return isVisible(this, elem);
  }

  /**
   * Sets the scrollbar to the given offset without easing
   */
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

  /**
   * Scrolls to given position with easing function
   */
  scrollTo(
    x = this.offset.x,
    y = this.offset.y,
    duration = 0,
    options: Partial<I.ScrollToOptions> = {},
  ) {
    scrollTo(this, x, y, duration, options);
  }

  /**
   * Scrolls the target element into visible area of scrollbar,
   * likes the DOM method `element.scrollIntoView().
   */
  scrollIntoView(
    elem: HTMLElement,
    options: Partial<I.ScrollIntoViewOptions> = {},
  ) {
    scrollIntoView(this, elem, options);
  }

  /**
   * Adds scrolling listener
   */
  addListener(fn: I.ScrollListener) {
    if (typeof fn !== 'function') {
      throw new TypeError('[smooth-scrollbar] scrolling listener should be a function');
    }

    this._listeners.add(fn);
  }

  /**
   * Removes listener previously registered with `scrollbar.addListener()`
   */
  removeListener(fn: I.ScrollListener) {
    this._listeners.delete(fn);
  }

  /**
   * Adds momentum and applys delta transformers.
   */
  addTransformableMomentum(
    x: number,
    y: number,
    fromEvent: Event,
    callback?: I.AddTransformableMomentumCallback,
  ) {
    this._updateDebounced();

    const finalDelta = this._plugins.reduce((delta, plugin) => {
      return plugin.transformDelta(delta, fromEvent) || delta;
    }, { x, y });

    const willScroll = !this._shouldPropagateMomentum(finalDelta.x, finalDelta.y);

    if (willScroll) {
      this.addMomentum(finalDelta.x, finalDelta.y);
    }

    if (callback) {
      callback.call(this, willScroll);
    }
  }

  /**
   * Increases scrollbar's momentum
   */
  addMomentum(x: number, y: number) {
    this.setMomentum(
      this._momentum.x + x,
      this._momentum.y + y,
    );
  }

  /**
   * Sets scrollbar's momentum to given value
   */
  setMomentum(x: number, y: number) {
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

  /**
   * Update options for specific plugin
   *
   * @param pluginName Name of the plugin
   * @param [options] An object includes the properties that you want to update
   */
  updatePluginOptions(pluginName: string, options?: any) {
    this._plugins.forEach((plugin) => {
      if (plugin.name === pluginName) {
        Object.assign(plugin.options, options);
      }
    });
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
    setStyle(containerEl, {
      overflow: '',
    });
    containerEl.scrollTop = this.scrollTop;
    containerEl.scrollLeft = this.scrollLeft;

    // invoke plugin.onDestroy
    this._plugins.forEach((plugin) => {
      plugin.onDestroy();
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

  @debounce(100, { leading: true })
  private _updateDebounced() {
    this.update();
  }

  // check whether to propagate monmentum to parent scrollbar
  // the following situations are considered as `true`:
  //         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
  //         2. scrollbar reaches one side and is not about to scroll on the other direction
  private _shouldPropagateMomentum(deltaX = 0, deltaY = 0): boolean {
    const {
      options,
      offset,
      limit,
    } = this;

    if (!options.continuousScrolling) return false;

    // force an update when scrollbar is "unscrollable", see #106
    if (limit.x === 0 && limit.y === 0) {
      this._updateDebounced();
    }

    const destX = clamp(deltaX + offset.x, 0, limit.x);
    const destY = clamp(deltaY + offset.y, 0, limit.y);
    let res = true;

    // offsets are not about to change
    // `&=` operator is not allowed for boolean types
    res = res && (destX === offset.x);
    res = res && (destY === offset.y);

    // current offsets are on the edge
    res = res && (offset.x === limit.x || offset.x === 0 || offset.y === limit.y || offset.y === 0);

    return res;
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

    if (Math.abs(remain) <= 0.1) {
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
