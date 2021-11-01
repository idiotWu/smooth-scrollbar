import './polyfills';
import * as I from './interfaces/';

import {
  scrollbarMap,
  Scrollbar,
} from './scrollbar';

import {
  addPlugins,
  ScrollbarPlugin,
} from './plugin';

import {
  attachStyle,
  detachStyle,
} from './style';

export { ScrollbarPlugin };

declare var __SCROLLBAR_VERSION__: string;

/**
 * cast `I.Scrollbar` to `Scrollbar` to avoid error
 *
 * `I.Scrollbar` is not assignable to `Scrollbar`:
 *     "privateProp" is missing in `I.Scrollbar`
 *
 * @see https://github.com/Microsoft/TypeScript/issues/2672
 */

export default class SmoothScrollbar extends Scrollbar {
  static version = __SCROLLBAR_VERSION__;

  static ScrollbarPlugin = ScrollbarPlugin;

  /**
   * Initializes a scrollbar on the given element.
   *
   * @param elem The DOM element that you want to initialize scrollbar to
   * @param [options] Initial options
   */
  static init(elem: HTMLElement, options?: Partial<I.ScrollbarOptions>): Scrollbar {
    if (!elem || elem.nodeType !== 1) {
      throw new TypeError(`expect element to be DOM Element, but got ${elem}`);
    }

    // attach stylesheet
    attachStyle();

    if (scrollbarMap.has(elem)) {
      return scrollbarMap.get(elem) as Scrollbar;
    }

    return new Scrollbar(elem, options);
  }

  /**
   * Automatically init scrollbar on all elements base on the selector `[data-scrollbar]`
   *
   * @param options Initial options
   */
  static initAll(options?: Partial<I.ScrollbarOptions>): Scrollbar[] {
    return Array.from(document.querySelectorAll('[data-scrollbar]'), (elem: HTMLElement) => {
      return SmoothScrollbar.init(elem, options);
    });
  }

  /**
   * Check if there is a scrollbar on given element
   *
   * @param elem The DOM element that you want to check
   */
  static has(elem: HTMLElement): boolean {
    return scrollbarMap.has(elem);
  }

  /**
   * Gets scrollbar on the given element.
   * If no scrollbar instance exsits, returns `undefined`
   *
   * @param elem The DOM element that you want to check.
   */
  static get(elem: HTMLElement): Scrollbar | undefined {
    return scrollbarMap.get(elem) as (Scrollbar | undefined);
  }

  /**
   * Returns an array that contains all scrollbar instances
   */
  static getAll(): Scrollbar[] {
    return Array.from(scrollbarMap.values()) as Scrollbar[];
  }

  /**
   * Removes scrollbar on the given element
   */
  static destroy(elem: HTMLElement) {
    const scrollbar = scrollbarMap.get(elem);

    if (scrollbar) {
      scrollbar.destroy();
    }
  }

  /**
   * Removes all scrollbar instances from current document
   */
  static destroyAll() {
    scrollbarMap.forEach((scrollbar) => {
      scrollbar.destroy();
    });
  }

  /**
   * Attaches plugins to scrollbars
   *
   * @param ...Plugins Scrollbar plugin classes
   */
  static use(...Plugins: (typeof ScrollbarPlugin)[]) {
    return addPlugins(...Plugins);
  }

  /**
   * Attaches default style sheets to current document.
   * You don't need to call this method manually unless
   * you removed the default styles via `Scrollbar.detachStyle()`
   */
  static attachStyle() {
    return attachStyle();
  }

  /**
   * Removes default styles from current document.
   * Use this method when you want to use your own css for scrollbars.
   */
  static detachStyle() {
    return detachStyle();
  }
}
