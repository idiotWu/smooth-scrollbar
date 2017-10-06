import {
  Scrollbar,
  ScrollToOptions,
} from '../interfaces/';

import {
  valueWithin,
} from '../utils/';

export function scrollTo(
  scrollbar: Scrollbar,
  x: number,
  y: number,
  duration = 0,
  { easing = defaultEasing, callback = null } = {} as ScrollToOptions,
) {
  const {
    options,
    offset,
    limit,
  } = scrollbar;

  if (options.renderByPixels) {
    // ensure resolved with integer
    x = Math.round(x);
    y = Math.round(y);
  }

  const startX = offset.x;
  const startY = offset.y;

  const disX = valueWithin(x, 0, limit.x) - startX;
  const disY = valueWithin(y, 0, limit.y) - startY;

  const start = Date.now();

  function scroll() {
    const elapse = Date.now() - start;
    const progress = easing(Math.min(elapse / duration, 1));

    scrollbar.setPosition(
      startX + disX * progress,
      startY + disY * progress,
    );

    if (elapse >= duration) {
      if (typeof callback === 'function') {
        callback.call(scrollbar);
      }
    } else {
      requestAnimationFrame(scroll);
    }
  }

  scroll();
}

/**
 * easeOutCubic
 */
function defaultEasing(t: number): number {
  return (t - 1) ** 3 + 1;
}
