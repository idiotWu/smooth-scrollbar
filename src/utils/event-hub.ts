import { Scrollbar } from '../interfaces/';

export interface EventHandler {
  (event: any): void;
}

type EventConfig = {
  elem: EventTarget,
  eventName: string,
  handler: EventHandler,
};

let eventListenerOptions: boolean | EventListenerOptions;

const eventMap = new WeakMap<Scrollbar, EventConfig[]>();

function getOptions(): typeof eventListenerOptions {
  if (eventListenerOptions !== undefined) {
    return eventListenerOptions;
  }

  let supportPassiveEvent = false;

  try {
    const noop = () => {};
    const options = Object.defineProperty({}, 'passive', {
      get() {
        supportPassiveEvent = true;
      },
    });
    window.addEventListener('testPassive', noop, options);
    window.removeEventListener('testPassive', noop, options);
  } catch (e) {}

  eventListenerOptions = supportPassiveEvent ? { passive: false } as EventListenerOptions : false;

  return eventListenerOptions;
}

export function eventScope(scrollbar: Scrollbar) {
  const configs = eventMap.get(scrollbar) || [];

  eventMap.set(scrollbar, configs);

  return function addEvent(
    elem: EventTarget,
    events: string,
    fn: EventHandler,
   ) {
    function handler(event: any) {
      // ignore default prevented events
      if (event.defaultPrevented) {
        return;
      }

      fn(event);
    }

    events.split(/\s+/g).forEach((eventName) => {
      configs.push({ elem, eventName, handler });

      elem.addEventListener(eventName, handler, getOptions());
    });
  };
}

export function clearEventsOn(scrollbar: Scrollbar) {
  const configs = eventMap.get(scrollbar);

  if (!configs) {
    return;
  }

  configs.forEach(({ elem, eventName, handler }) => {
    elem.removeEventListener(eventName, handler, getOptions());
  });

  eventMap.delete(scrollbar);
}
