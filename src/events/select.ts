import clamp from 'lodash-es/clamp';
import * as I from '../interfaces/';

import {
  eventScope,
  getPosition,
} from '../utils/';

export function selectHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);
  const {
    containerEl,
    contentEl,
    offset,
    limit,
  } = scrollbar;

  let isSelected = false;
  let animationID: number;

  function scroll({ x, y }) {
    if (!x && !y) return;

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

  addEvent(contentEl, 'selectstart', (evt: Event) => {
    evt.stopPropagation();
    cancelAnimationFrame(animationID);

    isSelected = true;
  });

  addEvent(window, 'mouseup blur', () => {
    cancelAnimationFrame(animationID);

    isSelected = false;
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

  if (x === 0 && y === 0) return res;

  if (x > right) {
    res.x = (x - right);
  } else if (x < left) {
    res.x = (x - left);
  }

  if (y > bottom) {
    res.y = (y - bottom);
  } else if (y < top) {
    res.y = (y - top);
  }

  return res;
}
