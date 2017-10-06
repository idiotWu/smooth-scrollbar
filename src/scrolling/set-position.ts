import * as I from '../interfaces/';

import {
  setStyle,
  valueWithin,
} from '../utils/';

export function setPosition(
  scrollbar: I.Scrollbar,
  x: number,
  y: number,
): I.ScrollStatus | null {
  const {
    options,
    offset,
    limit,
    track,
    contentEl,
  } = scrollbar;

  if (options.renderByPixels) {
    x = Math.round(x);
    y = Math.round(y);
  }

  if (x !== offset.x) track.xAxis.show();
  if (y !== offset.y) track.yAxis.show();

  x = valueWithin(x, 0, limit.x);
  y = valueWithin(y, 0, limit.y);

  if (x === offset.x && y === offset.y) {
    return null;
  }

  offset.x = x;
  offset.y = y;

  setStyle(contentEl, {
    '-transform': `translate3d(${-x}px, ${-y}px, 0)`,
  });

  track.update();

  return {
    offset: { ...offset },
    limit: { ...limit },
  };
}
