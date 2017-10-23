import * as I from '../interfaces/';

import {
  eventScope,
  shoulePropagateMomentum,
} from '../utils/';

const DELTA_SCALE = {
  STANDARD: 1,
  OTHERS: -3,
};

const DELTA_MODE = [1.0, 28.0, 500.0];

const getDeltaMode = (mode) => DELTA_MODE[mode] || DELTA_MODE[0];

export function wheelHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);

  const target = scrollbar.options.wheelEventTarget || scrollbar.containerEl;

  addEvent(target, 'onwheel' in window ? 'wheel' : 'mousewheel', (evt: WheelEvent) => {
    const { x, y } = normalizeDelta(evt);

    if (shoulePropagateMomentum(scrollbar, x, y)) {
      return;
    }

    evt.preventDefault();

    scrollbar.addTransformableMomentum(x, y, evt);
  });
}

/**
 * Normalizing wheel delta
 */
function normalizeDelta(evt: WheelEvent) {
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
