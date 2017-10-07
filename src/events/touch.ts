import clamp from 'lodash-es/clamp';
import * as I from '../interfaces/';

import {
  GLOBAL_ENV,
} from '../shared/';

import {
  eventScope,
  TouchRecord,
  shoulePropagateMomentum,
} from '../utils/';

const MIN_VELOCITY = 100;

let activeScrollbar: I.Scrollbar | null;

export function touchHandler(scrollbar: I.Scrollbar) {
  const container = scrollbar.containerEl;
  const touchRecord = new TouchRecord();
  const addEvent = eventScope(scrollbar);

  let damping: number;

  addEvent(container, 'touchstart', (evt: TouchEvent) => {
    // start records
    touchRecord.track(evt);

    // stop scrolling
    scrollbar.setMomentum(0, 0);

    // save damping
    damping = scrollbar.options.damping;
    scrollbar.options.damping = Math.max(damping, 0.5);
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
    const movement = { x: 0, y: 0 };

    Object.keys(velocity).forEach(dir => {
      const value = clamp(velocity[dir] * GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

      // throw small values
      movement[dir] = Math.abs(value) > MIN_VELOCITY ? value : 0;
    });

    scrollbar.addTransformableMomentum(
      movement.x,
      movement.y,
      evt,
    );

    scrollbar.options.damping = damping;
    touchRecord.release(evt);
    activeScrollbar = null;
  });
}
