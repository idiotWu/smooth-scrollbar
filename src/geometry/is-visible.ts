import * as I from '../interfaces/';

export function isVisible(scrollbar: I.Scrollbar, elem: HTMLElement): boolean {
  const { bounding } = scrollbar;
  const targetBounding = elem.getBoundingClientRect();

  // check overlapping
  const top = Math.max(bounding.top, targetBounding.top);
  const left = Math.max(bounding.left, targetBounding.left);
  const right = Math.min(bounding.right, targetBounding.right);
  const bottom = Math.min(bounding.bottom, targetBounding.bottom);

  return top < bottom && left < right;
}
