import {
    getPrivateProp,
} from '../utils/';

/**
 * Get scroll content element
 * @public
 */
export function getContentElem() {
    return this::getPrivateProp('targets').content;
};
