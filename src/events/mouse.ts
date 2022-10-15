import { clamp } from '../utils';
import * as I from '../interfaces/';

import {
  isOneOf,
  getPosition,
  eventScope,
  setStyle,
} from '../utils/';

enum Direction { X, Y }

export function mouseHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);
  const container = scrollbar.containerEl;
  const { xAxis, yAxis } = scrollbar.track;

  function calcMomentum(
    direction: Direction,
    clickPosition: number,
  ): number {
    const {
      size,
      limit,
      offset,
    } = scrollbar;

    if (direction === Direction.X) {
      const totalWidth = size.container.width + (xAxis.thumb.realSize - xAxis.thumb.displaySize);

      return clamp(clickPosition / totalWidth * size.content.width, 0, limit.x) - offset.x;
    }

    if (direction === Direction.Y) {
      const totalHeight = size.container.height + (yAxis.thumb.realSize - yAxis.thumb.displaySize);

      return clamp(clickPosition / totalHeight * size.content.height, 0, limit.y) - offset.y;
    }

    return 0;
  }

  function getTrackDirection(
    elem: HTMLElement,
  ): Direction | undefined {
    if (isOneOf(elem, [xAxis.element, xAxis.thumb.element])) {
      return Direction.X;
    }

    if (isOneOf(elem, [yAxis.element, yAxis.thumb.element])) {
      return Direction.Y;
    }

    return void 0;
  }

  let isMouseDown: boolean;
  let isMouseMoving: boolean;
  let startOffsetToThumb: { x: number, y: number };
  let trackDirection: Direction | undefined;
  let containerRect: ClientRect;

  addEvent(container, 'click', (evt: MouseEvent) => {
    if (isMouseMoving || !isOneOf(evt.target, [xAxis.element, yAxis.element])) {
      return;
    }

    const track = evt.target as HTMLElement;
    const direction = getTrackDirection(track);
    const rect = track.getBoundingClientRect();
    const clickPos = getPosition(evt);

    if (direction === Direction.X) {
      const offsetOnTrack = clickPos.x - rect.left - xAxis.thumb.displaySize / 2;
      scrollbar.setMomentum(calcMomentum(direction, offsetOnTrack), 0);
    }

    if (direction === Direction.Y) {
      const offsetOnTrack = clickPos.y - rect.top - yAxis.thumb.displaySize / 2;
      scrollbar.setMomentum(0, calcMomentum(direction, offsetOnTrack));
    }
  });

  addEvent(container, 'mousedown', (evt: MouseEvent) => {
    if (!isOneOf(evt.target, [xAxis.thumb.element, yAxis.thumb.element])) {
      return;
    }

    isMouseDown = true;

    const thumb = evt.target as HTMLElement;
    const cursorPos = getPosition(evt);
    const thumbRect = thumb.getBoundingClientRect();

    trackDirection = getTrackDirection(thumb);

    // pointer offset to thumb
    startOffsetToThumb = {
      x: cursorPos.x - thumbRect.left,
      y: cursorPos.y - thumbRect.top,
    };

    // container bounding rectangle
    containerRect = container.getBoundingClientRect();

    // prevent selection, see:
    // https://github.com/idiotWu/smooth-scrollbar/issues/48
    setStyle(scrollbar.containerEl, {
      '-user-select': 'none',
    });
  });

  addEvent(window, 'mousemove', (evt) => {
    if (!isMouseDown) return;

    isMouseMoving = true;

    const cursorPos = getPosition(evt);

    if (trackDirection === Direction.X) {
      // get percentage of pointer position in track
      // then tranform to px
      // don't need easing
      const offsetOnTrack = cursorPos.x - startOffsetToThumb.x - containerRect.left;
      scrollbar.setMomentum(calcMomentum(trackDirection, offsetOnTrack), 0);
    }

    if (trackDirection === Direction.Y) {
      const offsetOnTrack = cursorPos.y - startOffsetToThumb.y - containerRect.top;
      scrollbar.setMomentum(0, calcMomentum(trackDirection, offsetOnTrack));
    }
  });

  addEvent(window, 'mouseup blur', () => {
    isMouseDown = isMouseMoving = false;

    setStyle(scrollbar.containerEl, {
      '-user-select': '',
    });
  });
}
