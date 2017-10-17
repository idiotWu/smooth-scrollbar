import clamp from 'lodash-es/clamp';
import { Scrollbar } from '../interfaces/';

// check whether to propagate monmentum to parent scrollbar
// this situations are considered as `true`:
//         1. continuous scrolling is enabled (automatically disabled when overscroll is enabled)
//         2. scrollbar reaches one side and is not about to scroll on the other direction
export function shoulePropagateMomentum(
  scrollbar: Scrollbar,
  deltaX = 0,
  deltaY = 0,
): boolean {
  const {
    options,
    offset,
    limit,
  } = scrollbar;

  if (!options.continuousScrolling) return false;

  // force an update when scrollbar is "unscrollable", see #106
  if (limit.x === 0 && limit.y === 0) {
    scrollbar.update();
  }

  const destX = clamp(deltaX + offset.x, 0, limit.x);
  const destY = clamp(deltaY + offset.y, 0, limit.y);
  let res = true;

  // offsets are not about to change
  // `&=` operator is not allowed for boolean types
  res = res && (destX === offset.x);
  res = res && (destY === offset.y);

  // current offsets are on the edge
  res = res && (offset.x === limit.x || offset.x === 0 || offset.y === limit.y || offset.y === 0);

  return res;
}
