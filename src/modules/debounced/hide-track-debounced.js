import {
    debounce,
} from '../../helpers/';

import {
    hideTrack,
} from '../track/';

/**
 * 1000ms debounced hideTrack method
 * @private
 */
export const hideTrackDebounced = debounce(hideTrack, 1000, false);
