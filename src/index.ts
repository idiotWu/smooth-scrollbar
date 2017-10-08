import * as I from './interfaces/';

import { Scrollbar } from './scrollbar';

import {
  scrollbarMap,
} from './shared/';

import {
  addPlugins,
  ScrollbarPlugin,
} from './plugin';

import {
  attachStyle,
  detachStyle,
} from './style';

export { ScrollbarPlugin };

/*!
 * cast `I.Scrollbar` to `Scrollbar` to avoid error
 *
 * `I.Scrollbar` is not assignable to `Scrollbar`:
 *     "privateProp" is missing in `I.Scrollbar`
 *
 * @see https://github.com/Microsoft/TypeScript/issues/2672
 */

export default class SmoothScrollbar extends Scrollbar {
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

  static initAll(options?: Partial<I.ScrollbarOptions>): Scrollbar[] {
    return Array.from(document.querySelectorAll('[data-scrollbar]'), (elem: HTMLElement) => {
      return SmoothScrollbar.init(elem, options);
    });
  }

  static has(elem: HTMLElement): boolean {
    return scrollbarMap.has(elem);
  }

  static get(elem: HTMLElement): Scrollbar | undefined {
    return scrollbarMap.get(elem) as (Scrollbar | undefined);
  }

  static getAll(): Scrollbar[] {
    return Array.from(scrollbarMap.values()) as Scrollbar[];
  }

  static destroy(elem: HTMLElement) {
    const scrollbar = scrollbarMap.get(elem);

    if (scrollbar) {
      scrollbar.destroy();
    }
  }

  static destroyAll() {
    scrollbarMap.forEach((scrollbar) => {
      scrollbar.destroy();
    });
  }

  static use(...Plugins: (typeof ScrollbarPlugin)[]) {
    return addPlugins(...Plugins);
  }

  static attachStyle() {
    return attachStyle();
  }

  static detachStyle() {
    return detachStyle();
  }
}
