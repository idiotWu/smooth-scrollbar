import {
    getPrivateProp,
} from '../namespace/';

const ACTIONS = {
    REGIESTER: 0,
    UNREGIESTER: 1,
};

const METHODS = {
    [ACTIONS.REGIESTER]: 'addEventListener',
    [ACTIONS.UNREGIESTER]: 'removeEventListener',
};

/**
 * (un)Register DOM events
 * @public
 * @api
 * @param  {...string|regex} rules - A list of pattern of event names
 */
export const registerEvents = manageEvents(ACTIONS.REGIESTER, 'registerEvents');
export const unregisterEvents = manageEvents(ACTIONS.UNREGIESTER, 'unregisterEvents');

function matchSomeRules(str, rules) {
    return !!rules.length && rules.some(regex => str.match(regex));
};

function manageEvents(action = ACTIONS.REGIESTER, name = 'eventsManager') {
    const method = METHODS[action];

    function eventsManager(...rules) {
        this::getPrivateProp('eventHandlers').forEach((handler) => {
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

    Object.defineProperty(eventsManager, 'name', {
        value: name,
        configurable: true,
    });

    return eventsManager;
};
