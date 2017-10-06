import { Scrollbar } from '../interfaces/';
import { valueWithin } from './value-within';

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

  const destX = valueWithin(deltaX + offset.x, 0, limit.x);
  const destY = valueWithin(deltaY + offset.y, 0, limit.y);
  let res = true;

  // offsets are not about to change
  // `&=` operator is not allowed for boolean types
  res = res && (destX === offset.x);
  res = res && (destY === offset.y);

  // current offseta are on the edge
  res = res && (destX === limit.x || destX === 0 || destY === limit.y || destY === 0);

  return res;
}
