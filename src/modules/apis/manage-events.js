import {
    getPrivateProp,
} from '../utils/';

const ACTIONS = {
    REGIESTER: 0,
    UNREGIESTER: 1,
};

const METHODS = {
    [ACTIONS.REGIESTER]: 'addEventListener',
    [ACTIONS.UNREGIESTER]: 'removeEventListener',
};

export const registerEvents = manageEvents(ACTIONS.REGIESTER);
export const unregisterEvents = manageEvents(ACTIONS.UNREGIESTER);

function matchSomeRules(str, rules) {
    return !!rules.length && rules.some(regex => str.match(regex));
};

function manageEvents(action = ACTIONS.REGIESTER) {
    const method = METHODS[action];

    /**
     * (un)Register DOM events
     * @param  {...string|regex} rules - A list of pattern of event names
     */
    return function manager(...rules) {
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
};
