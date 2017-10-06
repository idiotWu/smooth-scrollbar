import * as I from '../interfaces/';

import {
  GLOBAL_ENV,
} from '../shared/';

import {
  eventScope,
  valueWithin,
  TouchRecord,
  shoulePropagateMomentum,
} from '../utils/';

const MIN_VELOCITY = 100;

let activeScrollbar: I.Scrollbar | null;

export function touchHandler(scrollbar: I.Scrollbar) {
  const container = scrollbar.containerEl;
  const touchRecord = new TouchRecord();
  const addEvent = eventScope(scrollbar);

  addEvent(container, 'touchstart', (evt: TouchEvent) => {
    // start records
    touchRecord.track(evt);

    // stop scrolling
    scrollbar.setMomentum(0, 0);
  });

  addEvent(container, 'touchmove', (evt: TouchEvent) => {
    if (activeScrollbar && activeScrollbar !== scrollbar) return;

    touchRecord.update(evt);

    const { x, y } = touchRecord.getDelta();

    if (shoulePropagateMomentum(scrollbar, x, y)) {
      return;
    }

    evt.preventDefault();

    // TODO: scale damping factor
    scrollbar.addMomentum(x, y, evt);
    activeScrollbar = scrollbar;
  });

  addEvent(container, 'touchcancel touchend', (evt: TouchEvent) => {
    const velocity = touchRecord.getVelocity();
    const movement = { x: 0, y: 0 };

    Object.keys(velocity).forEach(dir => {
      const value = valueWithin(velocity[dir] * GLOBAL_ENV.EASING_MULTIPLIER, -1e3, 1e3);

      // throw small values
      movement[dir] = Math.abs(value) > MIN_VELOCITY ? value : 0;
    });

    scrollbar.addMomentum(
      movement.x,
      movement.y,
      evt,
    );

    touchRecord.release(evt);
    activeScrollbar = null;
  });
}
