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
  const { containerEl, bounding } = scrollbar;

  if (!elem || !containerEl.contains(elem)) return;

  const targetBounding = elem.getBoundingClientRect();

  if (onlyScrollIfNeeded && scrollbar.isVisible(elem)) return;

  scrollbar.setMomentum(
    targetBounding.left - bounding.left - offsetLeft,
    alignToTop ? targetBounding.top - bounding.top - offsetTop : targetBounding.bottom - bounding.bottom - offsetBottom,
  );
}
