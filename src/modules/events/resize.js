import {
    updateDebounced,
} from '../debounced/';

import { addEvent } from '../utils/';

/**
 * Resize events handlers
 * @private
 */
export function handleResizeEvents() {
    this::addEvent(window, 'resize', this::updateDebounced);
};
