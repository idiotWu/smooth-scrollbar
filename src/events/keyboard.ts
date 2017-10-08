import * as I from '../interfaces/';

import {
  eventScope,
  shoulePropagateMomentum,
} from '../utils/';

import {
  scrollbarMap,
} from '../shared/';

enum KEY_CODE {
  SPACE = 32,
  PAGE_UP,
  PAGE_DOWN,
  END,
  HOME,
  LEFT,
  UP,
  RIGHT,
  DOWN,
}

export function keyboardHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);
  const container = scrollbar.containerEl;

  addEvent(container, 'keydown', (evt: KeyboardEvent) => {
    if (document.activeElement !== container) {
      return;
    }

    const delta = getKeyDelta(scrollbar, evt.keyCode || evt.which);

    if (!delta) {
      return;
    }

    const [x, y] = delta;

    if (shoulePropagateMomentum(scrollbar, x, y)) {
      container.blur();
      focusParentScrollbar(scrollbar);
      return;
    }

    evt.preventDefault();

    scrollbar.addTransformableMomentum(x, y, evt);
  });
}

function getKeyDelta(scrollbar: I.Scrollbar, keyCode: number) {
  const {
    size,
    limit,
    offset,
  } = scrollbar;

  switch (keyCode) {
    case KEY_CODE.SPACE:
      return [0, 200];
    case KEY_CODE.PAGE_UP:
      return [0, -size.container.height + 40];
    case KEY_CODE.PAGE_DOWN:
      return [0, size.container.height - 40];
    case KEY_CODE.END:
      return [0, limit.y - offset.y];
    case KEY_CODE.HOME:
      return [0, -offset.y];
    case KEY_CODE.LEFT:
      return [-40, 0];
    case KEY_CODE.UP:
      return [0, -40];
    case KEY_CODE.RIGHT:
      return [40, 0];
    case KEY_CODE.DOWN:
      return [0, 40];
    default:
      return null;
  }
}

function focusParentScrollbar(scrollbar: I.Scrollbar) {
  let elem = scrollbar.containerEl.parentElement;

  while (elem) {
    const parentScrollbar = scrollbarMap.get(elem);

    if (parentScrollbar) {
      parentScrollbar.containerEl.focus();
      return;
    }

    elem = elem.parentElement;
  }
}
