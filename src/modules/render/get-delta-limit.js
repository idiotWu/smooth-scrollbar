import {
    getPrivateProp,
} from '../utils/';

/**
 * Get the limitation of scroll delta
 * @private
 * @param  {boolean} [allowOverscroll=false] - Whether allow overscroll or not
 * @return {object}  {x, y}
 */
export function getDeltaLimit(allowOverscroll = false) {
    const {
        options,
        offset,
        limit,
    } = this::getPrivateProp();

    if (allowOverscroll && (options.continuousScrolling || options.overscrollEffect)) {
        return {
            x: [-Infinity, Infinity],
            y: [-Infinity, Infinity],
        };
    }

    return {
        x: [-offset.x, limit.x - offset.x],
        y: [-offset.y, limit.y - offset.y],
    };
};
