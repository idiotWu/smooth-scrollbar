import {
    debounce,
} from '../../helpers/';

import {
    update,
} from '../metrics/';

/**
 * 100ms debounced update method
 * @private
 */
export const updateDebounced = debounce(update);
