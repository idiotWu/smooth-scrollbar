import {
    getPrivateProp,
} from '../utils/';

/**
 * Extend scrollbar options
 * @public
 * @param {Object} opts
 */
export function setOptions(opts = {}) {
    const {
        options,
    } = this::getPrivateProp();

    Reflect.ownKeys(opts).forEach((prop) => {
        if (!options.hasOwnProperty(prop) || opts[prop] === undefined) return;

        options[prop] = opts[prop];
    });
};
