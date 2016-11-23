import {
    updateDebounced,
} from '../debounced/';

import { addEvent } from './add-event';

/**
 * Resize events handlers
 * @private
 */
export function handleResizeEvents() {
    this::addEvent(window, 'resize', this::updateDebounced);
};
