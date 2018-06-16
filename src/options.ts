import {
  range,
  boolean,
} from './decorators/';

import {
  ScrollbarOptions,
} from './interfaces/';

export class Options {
  /**
   * Momentum reduction damping factor, a float value between `(0, 1)`.
   * The lower the value is, the more smooth the scrolling will be
   * (also the more paint frames).
   */
  @range(0, 1)
  damping = 0.1;

  /**
   * Minimal size for scrollbar thumbs.
   */
  @range(0, Infinity)
  thumbMinSize = 20;

  /**
   * Render every frame in integer pixel values
   * set to `true` to improve scrolling performance.
   */
  @boolean
  renderByPixels = true;

  /**
   * Keep scrollbar tracks visible
   */
  @boolean
  alwaysShowTracks = false;

  /**
   * Set to `true` to allow outer scrollbars continue scrolling
   * when current scrollbar reaches edge.
   */
  @boolean
  continuousScrolling = true;

  /**
   * Delegate wheel events and touch events to the given element.
   * By default, the container element is used.
   * This option will be useful for dealing with fixed elements.
   */
  delegateTo: EventTarget | null = null;

  get wheelEventTarget() {
    return this.delegateTo;
  }

  set wheelEventTarget(el: EventTarget | null) {
    console.warn('[smooth-scrollbar]: `options.wheelEventTarget` is deprecated and will be removed in the future, use `options.delegateTo` instead.');

    this.delegateTo = el;
  }

  /**
   * Options for plugins. Syntax:
   *   plugins[pluginName] = pluginOptions: any
   */
  readonly plugins: any = {};

  constructor(config: Partial<ScrollbarOptions> = {}) {
    Object.keys(config).forEach((prop) => {
      this[prop] = config[prop];
    });
  }
}
