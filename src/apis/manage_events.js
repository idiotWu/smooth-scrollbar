/**
 * @module
 * @prototype {Function} unregisterEvents
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function matchAllRules(str, rules) {
    return !!rules.length && rules.every(regex => str.match(regex));
};

function manageEvents(shouldUnregister) {
    shouldUnregister = !!shouldUnregister;

    let method = shouldUnregister ? 'removeEventListener' : 'addEventListener';

    return function(...rules) {
        this.__handlers.forEach((handler) => {
            let { elem, evt, fn, hasRegistered } = handler;

            // shouldUnregister = hasRegistered = false: register event
            // shouldUnregister = hasRegistered = true: unregister event
            if (shouldUnregister !== hasRegistered) return;

            if (matchAllRules(evt, rules)) {
                elem[method](evt, fn);
                handler.hasRegistered = !hasRegistered;
            }
        });
    };
};

SmoothScrollbar.prototype.unregisterEvents = manageEvents(true);
SmoothScrollbar.prototype.registerEvents = manageEvents(false);