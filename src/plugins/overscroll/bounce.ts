import Scrollbar from 'smooth-scrollbar';

import { setStyle } from '../../utils/set-style';

export class Bounce {
  constructor(
    private _scrollbar: Scrollbar,
  ) {}

  render({ x = 0, y = 0 }) {
    const {
      size,
      track,
      offset,
      contentEl,
    } = this._scrollbar;

    setStyle(contentEl, {
      '-transform': `translate3d(${-(offset.x + x)}px, ${-(offset.y + y)}px, 0)`,
    });

    if (x) {
      track.xAxis.show();

      const scaleRatio = size.container.width / (size.container.width + Math.abs(x));

      setStyle(track.xAxis.thumb.element, {
        '-transform': `translate3d(${track.xAxis.thumb.offset}px, 0, 0) scale3d(${scaleRatio}, 1, 1)`,
        '-transform-origin': x < 0 ? 'left' : 'right',
      });
    }

    if (y) {
      track.yAxis.show();

      const scaleRatio = size.container.height / (size.container.height + Math.abs(y));

      setStyle(track.yAxis.thumb.element, {
        '-transform': `translate3d(0, ${track.yAxis.thumb.offset}px, 0) scale3d(1, ${scaleRatio}, 1)`,
        '-transform-origin': y < 0 ? 'top' : 'bottom',
      });
    }

    track.autoHideOnIdle();
  }
}
