import * as I from '../interfaces/';
import { TrackDirection } from './direction';
import { setStyle } from '../utils/';

export class ScrollbarThumb implements I.ScrollbarThumb {
  readonly element = document.createElement('div');

  displaySize = 0;
  realSize = 0;
  offset = 0;

  constructor(
    private _direction: TrackDirection,
    private _minSize = 0,
  ) {
    this.element.className = `scrollbar-thumb scrollbar-thumb-${_direction}`;
  }

  attachTo(trackEl: HTMLDivElement) {
    trackEl.appendChild(this.element);
  }

  update(
    scrollOffset: number,
    containerSize: number,
    pageSize: number,
  ) {
    // calculate thumb size
    // pageSize > containerSize -> scrollable
    this.realSize = Math.min(containerSize / pageSize, 1) * containerSize;
    this.displaySize = Math.max(this.realSize, this._minSize);

    // calculate thumb offset
    this.offset = scrollOffset / pageSize * (containerSize + (this.realSize - this.displaySize));

    setStyle(this.element, this._getStyle());
  }

  private _getStyle() {
    switch (this._direction) {
      case TrackDirection.X:
        return {
          width: `${this.displaySize}px`,
          '-transform': `translate3d(${this.offset}px, 0, 0)`,
        };

      case TrackDirection.Y:
        return {
          height: `${this.displaySize}px`,
          '-transform': `translate3d(0, ${this.offset}px, 0)`,
        };

      default:
        return null;
    }
  }
}
