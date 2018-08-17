import clamp from 'lodash-es/clamp';

import * as I from '../interfaces/';

const animationIDStorage = new WeakMap<I.Scrollbar, number>();

export function scrollTo(
  scrollbar: I.Scrollbar,
  x: number,
  y: number,
  duration = 0,
  { easing = defaultEasing, callback }: Partial<I.ScrollToOptions> = {},
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

  const disX = clamp(x, 0, limit.x) - startX;
  const disY = clamp(y, 0, limit.y) - startY;

  const start = Date.now();

  function scroll() {
    const elapse = Date.now() - start;
    const progress = duration ? easing(Math.min(elapse / duration, 1)) : 1;

    scrollbar.setPosition(
      startX + disX * progress,
      startY + disY * progress,
    );

    if (elapse >= duration) {
      if (typeof callback === 'function') {
        callback.call(scrollbar);
      }
    } else {
      const animationID = requestAnimationFrame(scroll);
      animationIDStorage.set(scrollbar, animationID);
    }
  }

  cancelAnimationFrame(animationIDStorage.get(scrollbar) as number);
  scroll();
}

/**
 * easeOutCubic
 */
function defaultEasing(t: number): number {
  return (t - 1) ** 3 + 1;
}
