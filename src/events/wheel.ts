import normalizeWheel from 'normalize-wheel';
import * as I from '../interfaces/';

import {
  eventScope,
} from '../utils/';

export function wheelHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);
  const target = scrollbar.options.wheelEventTarget || scrollbar.containerEl;
  const eventName = 'onwheel' in window || document.implementation.hasFeature('Events.wheel', '3.0') ? 'wheel' : 'mousewheel';
  
  addEvent(target, eventName, (evt: WheelEvent) => {
    const { pixelX, pixelY } = normalizeWheel(evt);
    scrollbar.addTransformableMomentum(pixelX, pixelY, evt, (willScroll) => {
      if (willScroll) {
        evt.preventDefault();
      }
    });
  });
}
