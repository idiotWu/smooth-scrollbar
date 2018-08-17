import * as I from '../interfaces/';

import {
  eventScope,
} from '../utils/';

export function wheelHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);

  const target = scrollbar.options.delegateTo || scrollbar.containerEl;

  const eventName = ('onwheel' in window || document.implementation.hasFeature('Events.wheel', '3.0')) ? 'wheel' : 'mousewheel';

  addEvent(target, eventName, (evt: WheelEvent) => {
    const { x, y } = normalizeDelta(evt);

    scrollbar.addTransformableMomentum(x, y, evt, (willScroll) => {
      if (willScroll) {
        evt.preventDefault();
      }
    });
  });
}

// Normalizing wheel delta

const DELTA_SCALE = {
  STANDARD: 1,
  OTHERS: -3,
};

const DELTA_MODE = [1.0, 28.0, 500.0];

const getDeltaMode = (mode) => DELTA_MODE[mode] || DELTA_MODE[0];

function normalizeDelta(evt: any) {
  if ('deltaX' in evt) {
    const mode = getDeltaMode(evt.deltaMode);

    return {
      x: evt.deltaX / DELTA_SCALE.STANDARD * mode,
      y: evt.deltaY / DELTA_SCALE.STANDARD * mode,
    };
  }

  if ('wheelDeltaX' in evt) {
    return {
      x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
      y: evt.wheelDeltaY / DELTA_SCALE.OTHERS,
    };
  }

  // ie with touchpad
  return {
    x: 0,
    y: evt.wheelDelta / DELTA_SCALE.OTHERS,
  };
}
