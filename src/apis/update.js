/**
 * @module
 * @prototype {Function} update
 * @dependencies [ SmoothScrollbar, #getSize, #__setThumbPosition, #__readyonly pickInRange, setStyle ]
 */

import './get_size';
import '../internals';
import { pickInRange, setStyle } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Update scrollbars appearance in next animation frame
 *
 * @param {Function} cb: callback
 */
SmoothScrollbar.prototype.update = function(cb) {
    requestAnimationFrame(() => {
        let size = this.getSize();

        this.__readonly('size', size);

        let newLimit = {
            x: size.content.width - size.container.width,
            y: size.content.height - size.container.height
        };

        if (this.limit &&
            newLimit.x === this.limit.x &&
            newLimit.y === this.limit.y) return;

        this.__readonly('limit', newLimit);

        let { xAxis, yAxis } = this.targets;

        // hide scrollbar if content size less than container
        setStyle(xAxis.track, {
            'display': size.content.width <= size.container.width ? 'none' : 'block'
        });
        setStyle(yAxis.track, {
            'display': size.content.height <= size.container.height ? 'none' : 'block'
        });

        // use percentage value for thumb
        setStyle(xAxis.thumb, {
            'width': `${pickInRange(size.container.width / size.content.width, 0, 1) * 100}%`
        });
        setStyle(yAxis.thumb, {
            'height': `${pickInRange(size.container.height / size.content.height, 0, 1) * 100}%`
        });

        this.__setThumbPosition();

        if (typeof cb === 'function') cb(this);
    });
};