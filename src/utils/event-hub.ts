import { Scrollbar } from '../interfaces/';

export interface EventHandler {
  (event: any): void;
}

type EventConfig = {
  elem: EventTarget,
  eventName: string,
  handler: EventHandler,
};

const eventMap = new WeakMap<Scrollbar, EventConfig[]>();

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

      elem.addEventListener(eventName, handler);
    });
  };
}

export function clearEventsOn(scrollbar: Scrollbar) {
  const configs = eventMap.get(scrollbar);

  if (!configs) {
    return;
  }

  configs.forEach(({ elem, eventName, handler }) => {
    elem.removeEventListener(eventName, handler);
  });

  eventMap.delete(scrollbar);
}
