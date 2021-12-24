import * as I from '../interfaces/';

import {
  eventScope,
  TouchRecord,
} from '../utils/';

let activeScrollbar: I.Scrollbar | null;

export function touchHandler(scrollbar: I.Scrollbar) {
  const target = scrollbar.options.delegateTo || scrollbar.containerEl;
  const touchRecord = new TouchRecord();
  const addEvent = eventScope(scrollbar);

  let damping: number;
  let pointerCount = 0;

  addEvent(target, 'touchstart', (evt: TouchEvent) => {
    // start records
    touchRecord.track(evt);

    // stop scrolling
    scrollbar.setMomentum(0, 0);

    // save damping
    if (pointerCount === 0) {
      damping = scrollbar.options.damping;
      scrollbar.options.damping = Math.max(damping, 0.5); // less frames on touchmove
    }

    pointerCount++;
  });

  addEvent(target, 'touchmove', (evt: TouchEvent) => {
    if (activeScrollbar && activeScrollbar !== scrollbar) return;

    touchRecord.update(evt);

    const { x, y } = touchRecord.getDelta();

    scrollbar.addTransformableMomentum(x, y, evt, (willScroll) => {
      if (willScroll && evt.cancelable) {
        evt.preventDefault();
        activeScrollbar = scrollbar;
      }
    });
  });

  addEvent(target, 'touchcancel touchend', (evt: TouchEvent) => {
    const delta = touchRecord.getEasingDistance(damping);

    scrollbar.addTransformableMomentum(
      delta.x,
      delta.y,
      evt,
    );

    pointerCount--;

    // restore damping
    if (pointerCount === 0) {
      scrollbar.options.damping = damping;
    }

    touchRecord.release(evt);
    activeScrollbar = null;
  });
}
