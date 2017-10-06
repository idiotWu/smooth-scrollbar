import { ScrollbarPlugin } from 'smooth-scrollbar';

export type Delta = {
  x: number,
  y: number,
};

export default class OverscrollPlugin extends ScrollbarPlugin {
  static pluginName = 'overscroll';

  static defaultOptions = {
    effect: null,
    damping: 0.2,
    glowColor: '#87ceeb',
  };

  onInit() {
    this.scrollbar.addListener(this._scrollListener.bind(this));
  }

  transformDelta(delta: Delta, fromEvent: Event): Delta {

  }

  private _scrollListener() {
    const {
      offset,
      limit,
    } = this.scrollbar;


  }
}
