import clamp from 'lodash-es/clamp';

import * as I from '../interfaces/';

export function scrollIntoView(
  scrollbar: I.Scrollbar,
  elem: HTMLElement,
  {
    alignToTop = true,
    onlyScrollIfNeeded = false,
    offsetTop = 0,
    offsetLeft = 0,
    offsetBottom = 0,
  }: Partial<I.ScrollIntoViewOptions> = {},
) {
  const {
    containerEl,
    bounding,
    offset,
    limit,
  } = scrollbar;

  if (!elem || !containerEl.contains(elem)) return;

  const targetBounding = elem.getBoundingClientRect();

  if (onlyScrollIfNeeded && scrollbar.isVisible(elem)) return;

  const delta = alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom + offsetBottom;

  scrollbar.setMomentum(
    targetBounding.left - bounding.left - offsetLeft,
    clamp(delta, -offset.y, limit.y - offset.y),
  );
}
