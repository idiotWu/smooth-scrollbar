import {
    addEvent,
} from '../dom/';

import {
    getPrivateMethod,
} from '../utils/';

/**
 * Resize events handlers
 * @private
 */
export function handleResizeEvents() {
    this::addEvent(window, 'resize', this::getPrivateMethod('updateDebounce'));
};
