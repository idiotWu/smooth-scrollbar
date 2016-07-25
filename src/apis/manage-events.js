/**
 * @module
 * @prototype {Function} unregisterEvents
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

const ACTIONS = {
    REGIESTER: 0,
    UNREGIESTER: 1,
};

const METHODS = {
    [ACTIONS.REGIESTER]: 'addEventListener',
    [ACTIONS.UNREGIESTER]: 'removeEventListener',
};

function matchSomeRules(str, rules) {
    return !!rules.length && rules.some(regex => str.match(regex));
};

function manageEvents(action = ACTIONS.REGIESTER) {
    const method = METHODS[action];

    return function (...rules) {
        this.__handlers.forEach((handler) => {
            const {
                elem,
                evt,
                fn,
                hasRegistered,
            } = handler;

            if ((hasRegistered && action === ACTIONS.REGIESTER) ||
                (!hasRegistered && action === ACTIONS.UNREGIESTER)) {
                return;
            }

            if (matchSomeRules(evt, rules)) {
                elem[method](evt, fn);
                handler.hasRegistered = !hasRegistered;
            }
        });
    };
};

SmoothScrollbar.prototype.registerEvents = manageEvents(ACTIONS.REGIESTER);
SmoothScrollbar.prototype.unregisterEvents = manageEvents(ACTIONS.UNREGIESTER);
