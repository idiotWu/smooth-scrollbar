import './polyfills';
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

export default class SmoothScrollbar extends Scrollbar {
  static init(elem: HTMLElement, options?: I.ScrollbarOptions): I.Scrollbar {
    if (!elem || elem.nodeType !== 1) {
      throw new TypeError(`expect element to be DOM Element, but got ${typeof elem}`);
    }

    if (scrollbarMap.has(elem)) {
      return scrollbarMap.get(elem) as Scrollbar;
    }

    return new SmoothScrollbar(elem, options);
  }

  static initAll(options?: I.ScrollbarOptions): I.Scrollbar[] {
    return Array.from(document.querySelectorAll('[data-scrollbar]'), (elem: HTMLElement) => {
      return SmoothScrollbar.init(elem, options);
    });
  }

  static has(elem: HTMLElement): boolean {
    return scrollbarMap.has(elem);
  }

  static get(elem: HTMLElement): I.Scrollbar | undefined {
    return scrollbarMap.get(elem);
  }

  static getAll(): I.Scrollbar[] {
    return Array.from(scrollbarMap.values());
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
