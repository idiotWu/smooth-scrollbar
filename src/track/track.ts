import * as I from '../interfaces/';
import { TrackDirection } from './direction';
import { ScrollbarThumb } from './thumb';

import {
  setStyle,
} from '../utils/';

export class ScrollbarTrack implements I.ScrollbarTrack {
  readonly thumb: ScrollbarThumb;

  /**
   * Track element
   */
  readonly element = document.createElement('div');

  private _isShown = false;

  constructor(
    direction: TrackDirection,
    thumbMinSize: number = 0,
  ) {
    this.element.className = `scrollbar-track scrollbar-track-${direction}`;

    this.thumb = new ScrollbarThumb(
      direction,
      thumbMinSize,
    );

    this.thumb.attachTo(this.element);
  }

  /**
   * Attach to scrollbar container element
   *
   * @param scrollbarContainer Scrollbar container element
   */
  attachTo(scrollbarContainer: HTMLElement) {
    scrollbarContainer.appendChild(this.element);
  }

  /**
   * Show track immediately
   */
  show() {
    if (this._isShown) {
      return;
    }

    this._isShown = true;
    this.element.classList.add('show');
  }

  /**
   * Hide track immediately
   */
  hide() {
    if (!this._isShown) {
      return;
    }

    this._isShown = false;
    this.element.classList.remove('show');
  }

  update(
    scrollOffset: number,
    containerSize: number,
    pageSize: number,
  ) {
    setStyle(this.element, {
      display: pageSize <= containerSize ? 'none' : 'block',
    });

    this.thumb.update(scrollOffset, containerSize, pageSize);
  }
}
