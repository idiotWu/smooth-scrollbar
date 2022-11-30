import {
  TrackController,
} from './track';

import { Data2d } from './data-2d';

// Scrollbar.options
export type ScrollbarOptions = {
  /**
   * Momentum reduction damping factor, a float value between `(0, 1)`. The lower the value is, the more smooth the scrolling will be (also the more paint frames).
   * @default 0.1
   */
  damping: number,
  /**
   *  Minimal size for scrollbar thumbs.
   * @default 20
   */
  thumbMinSize: number,
  /**
   * Render every frame in integer pixel values, set to `true` to **improve** scrolling performance.
   * @default true
   */
  renderByPixels: boolean,
  /**
   * Keep scrollbar tracks visible.
   * @default false
   */
  alwaysShowTracks: boolean,
  /**
   * Set to `true` to allow outer scrollbars continue scrolling when current scrollbar reaches edge.
   * @default true
   */
  continuousScrolling: boolean,
  /**
   *  Delegate wheel events and touch events to the given element. By default, the container element is used. This option will be useful for dealing with fixed elements.
   * @default null
   */
  delegateTo: EventTarget | null,
  /**
   * @deprecated `wheelEventTarget` is deprecated and will be removed in the future, use `delegateTo` instead.
   */
  wheelEventTarget: EventTarget | null,
  /**
   * Options for plugins, see {@link https://github.com/idiotWu/smooth-scrollbar/blob/develop/docs/plugin.md Plugin System}.
   */
  plugins: any,
};

// Scrollbar.size
export type Metrics = {
  width: number,
  height: number,
};

export type ScrollbarSize = {
  container: Metrics,
  content: Metrics,
};

// Scrollbar.bounding
export type ScrollbarBounding = {
  top: number,
  right: number,
  bottom: number,
  left: number,
};

// Scrolling Listener
export type ScrollStatus = {
  offset: Data2d,
  limit: Data2d,
};

export interface ScrollListener {
  (this: Scrollbar, status: ScrollStatus): void;
}

// `scrollTo` options
export type ScrollToOptions = {
  callback: (this: Scrollbar) => void,
  easing: (percent: number) => number,
};

// `setPosition` options
export type SetPositionOptions = {
  withoutCallbacks: boolean,
};

// `scrollIntoView` options
export type ScrollIntoViewOptions = {
  alignToTop: boolean,
  onlyScrollIfNeeded: boolean,
  offsetTop: number,
  offsetLeft: number,
  offsetBottom: number,
};

export interface AddTransformableMomentumCallback {
  (this: Scrollbar, willScroll: boolean): void;
}

// Scrollbar Class
export interface Scrollbar {
  readonly parent: Scrollbar | null;

  readonly containerEl: HTMLElement;
  readonly contentEl: HTMLElement;

  readonly track: TrackController;

  readonly options: ScrollbarOptions;

  bounding: ScrollbarBounding;
  size: ScrollbarSize;

  offset: Data2d;
  limit: Data2d;

  scrollTop: number;
  scrollLeft: number;

  destroy(): void;

  update(): void;
  getSize(): ScrollbarSize;
  isVisible(elem: HTMLElement): boolean;

  addListener(fn: ScrollListener): void;
  removeListener(fn: ScrollListener): void;

  addTransformableMomentum(x: number, y: number, fromEvent: Event, callback?: AddTransformableMomentumCallback): void;
  addMomentum(x: number, y: number): void;
  setMomentum(x: number, y: number): void;

  scrollTo(x?: number, y?: number, duration?: number, options?: Partial<ScrollToOptions>): void;
  setPosition(x?: number, y?: number, options?: Partial<SetPositionOptions>): void;
  scrollIntoView(elem: HTMLElement, options?: Partial<ScrollIntoViewOptions>): void;

  updatePluginOptions(pluginName: string, options?: any): void;
}
