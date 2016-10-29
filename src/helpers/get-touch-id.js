import { getPointerData } from './get-pointer-data';

/**
 * Get touch identifier
 * @param {object} evt - Event object
 * @return {number}: touch id
 */
export function getTouchID(evt) {
    const data = getPointerData(evt);

    return data.identifier;
};
