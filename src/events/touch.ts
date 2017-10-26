import * as I from '../interfaces/';

import {
  eventScope,
  TouchRecord,
  shoulePropagateMomentum,
} from '../utils/';

let activeScrollbar: I.Scrollbar | null;

export function touchHandler(scrollbar: I.Scrollbar) {
  const MIN_EAING_MOMENTUM = 50;
  const EASING_MULTIPLIER = /Android/.test(navigator.userAgent) ? 3 : 2;

  const container = scrollbar.containerEl;
  const touchRecord = new TouchRecord();
  const addEvent = eventScope(scrollbar);

  let damping: number;
  let pointerCount = 0;

  addEvent(container, 'touchstart', (evt: TouchEvent) => {
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

  addEvent(container, 'touchmove', (evt: TouchEvent) => {
    if (activeScrollbar && activeScrollbar !== scrollbar) return;

    touchRecord.update(evt);

    const { x, y } = touchRecord.getDelta();

    if (shoulePropagateMomentum(scrollbar, x, y)) {
      return;
    }

    evt.preventDefault();

    scrollbar.addTransformableMomentum(x, y, evt);
    activeScrollbar = scrollbar;
  });

  addEvent(container, 'touchcancel touchend', (evt: TouchEvent) => {
    const velocity = touchRecord.getVelocity();
    const momentum = { x: 0, y: 0 };

    Object.keys(velocity).forEach(dir => {
      const s = velocity[dir] / damping;

      // throw small values
      momentum[dir] = Math.abs(s) < MIN_EAING_MOMENTUM ? 0 : s * EASING_MULTIPLIER;
    });

    scrollbar.addTransformableMomentum(
      momentum.x,
      momentum.y,
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
