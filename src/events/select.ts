import clamp from 'lodash-es/clamp';
import * as I from '../interfaces/';

import {
  eventScope,
  getPosition,
} from '../utils/';

export function selectHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);
  const { containerEl, contentEl } = scrollbar;

  let isSelected = false;
  let isContextMenuOpened = false; // flag to prevent selection when context menu is opened
  let animationID: number;

  function scroll({ x, y }) {
    if (!x && !y) return;

    const { offset, limit } = scrollbar;
    // DISALLOW delta transformation
    scrollbar.setMomentum(
      clamp(offset.x + x, 0, limit.x) - offset.x,
      clamp(offset.y + y, 0, limit.y) - offset.y,
    );

    animationID = requestAnimationFrame(() => {
      scroll({ x, y });
    });
  }

  addEvent(window, 'mousemove', (evt: MouseEvent) => {
    if (!isSelected) return;

    cancelAnimationFrame(animationID);

    const dir = calcMomentum(scrollbar, evt);

    scroll(dir);
  });

  // prevent scrolling when context menu is opened
  // NOTE: `contextmenu` event may be fired
  //          1. BEFORE `selectstart`: when user right-clicks on the text content -> prevent future scrolling,
  //          2. AFTER `selectstart`: when user right-clicks on the blank area -> cancel current scrolling,
  //        so we need to both set the flag and cancel current scrolling
  addEvent(contentEl, 'contextmenu', () => {
    // set the flag to prevent future scrolling
    isContextMenuOpened = true;

    // stop current scrolling
    cancelAnimationFrame(animationID);
    isSelected = false;
  });

  // reset context menu flag on mouse down
  // to ensure the scrolling is allowed in the next selection
  addEvent(contentEl, 'mousedown', () => {
    isContextMenuOpened = false;
  });

  addEvent(contentEl, 'selectstart', () => {
    if (isContextMenuOpened) {
      return;
    }

    cancelAnimationFrame(animationID);

    isSelected = true;
  });

  addEvent(window, 'mouseup blur', () => {
    cancelAnimationFrame(animationID);

    isSelected = false;
    isContextMenuOpened = false;
  });

  // patch for touch devices
  addEvent(containerEl, 'scroll', (evt: Event) => {
    evt.preventDefault();
    containerEl.scrollTop = containerEl.scrollLeft = 0;
  });
}

function calcMomentum(
  scrollbar: I.Scrollbar,
  evt: MouseEvent,
) {
  const { top, right, bottom, left } = scrollbar.bounding;
  const { x, y } = getPosition(evt);

  const res = {
    x: 0,
    y: 0,
  };

  const padding = 20;

  if (x === 0 && y === 0) return res;

  if (x > right - padding) {
    res.x = (x - right + padding);
  } else if (x < left + padding) {
    res.x = (x - left - padding);
  }

  if (y > bottom - padding) {
    res.y = (y - bottom + padding);
  } else if (y < top + padding) {
    res.y = (y - top - padding);
  }

  res.x *= 2;
  res.y *= 2;

  return res;
}
