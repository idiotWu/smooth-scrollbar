import {
    getPrivateProp,
} from '../utils/';

/**
 * Add scrolling listener
 * @public
 * @param {function} cb - Scroll listener
 */
export function addListener(cb) {
    if (typeof cb !== 'function') return;

    this::getPrivateProp('scrollListeners').push(cb);
};

/**
 * Remove specific listener from all
 * @public
 * @param {function} cb - Scroll listener
 */
export function removeListener(cb) {
    if (typeof cb !== 'function') return;

    this::getPrivateProp('scrollListeners').some((fn, idx, all) => {
        return fn === cb && all.splice(idx, 1);
    });
};
