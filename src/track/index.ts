import * as I from '../interfaces/';

import { ScrollbarTrack } from './track';
import { TrackDirection } from './direction';

import {
  debounce,
} from '../decorators/';

export class TrackController implements I.TrackController {
  readonly xAxis: ScrollbarTrack;
  readonly yAxis: ScrollbarTrack;

  constructor(
    private _scrollbar: I.Scrollbar,
  ) {
    const thumbMinSize = _scrollbar.options.thumbMinSize;

    this.xAxis = new ScrollbarTrack(TrackDirection.X, thumbMinSize);
    this.yAxis = new ScrollbarTrack(TrackDirection.Y, thumbMinSize);

    this.xAxis.attachTo(_scrollbar.containerEl);
    this.yAxis.attachTo(_scrollbar.containerEl);

    if (_scrollbar.options.alwaysShowTracks) {
      this.xAxis.show();
      this.yAxis.show();
    }
  }

  /**
   * Updates track appearance
   */
  update() {
    const {
      size,
      offset,
    } = this._scrollbar;

    this.xAxis.update(offset.x, size.container.width, size.content.width);
    this.yAxis.update(offset.y, size.container.height, size.content.height);
  }

  /**
   * Automatically hide tracks when scrollbar is in idle state
   */
  @debounce(300)
  autoHideOnIdle() {
    if (this._scrollbar.options.alwaysShowTracks) {
      return;
    }

    this.xAxis.hide();
    this.yAxis.hide();
  }
}
