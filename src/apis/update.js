/**
 * @module
 * @prototype {Function} update
 */

import { setStyle } from '../utils/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Update scrollbars appearance
 *
 * @param {Boolean} async: update asynchronous
 */
SmoothScrollbar.prototype.update = function(async = true) {
    // update canvas
    let updateCanvas = () => {
        const { targets, options, size } = this;
        const { elem, context } = targets.canvas;

        if (options.overscrollEffect === 'glow') {
            const DPR = window.devicePixelRatio || 1;

            elem.width = size.container.width * DPR;
            elem.height = size.container.height * DPR;

            context.scale(DPR, DPR);
        }
    };

    let update = () => {
        this.__updateBounding();

        let size = this.getSize();

        this.__readonly('size', size);

        let newLimit = {
            x: size.content.width - size.container.width,
            y: size.content.height - size.container.height
        };

        if (this.limit &&
            newLimit.x === this.limit.x &&
            newLimit.y === this.limit.y) {
            return updateCanvas();
        }

        const { targets, options } = this;

        let thumbSize = {
            // real thumb sizes
            realX: size.container.width / size.content.width * size.container.width,
            realY: size.container.height / size.content.height * size.container.height
        };

        // rendered thumb sizes
        thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
        thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);

        this.__readonly('limit', newLimit)
            .__readonly('thumbSize', thumbSize);

        const { xAxis, yAxis } = targets;

        // hide scrollbar if content size less than container
        setStyle(xAxis.track, {
            'display': size.content.width <= size.container.width ? 'none' : 'block'
        });
        setStyle(yAxis.track, {
            'display': size.content.height <= size.container.height ? 'none' : 'block'
        });

        // use percentage value for thumb
        setStyle(xAxis.thumb, {
            'width': `${thumbSize.x}px`
        });
        setStyle(yAxis.thumb, {
            'height': `${thumbSize.y}px`
        });

        // re-positioning
        const { offset, limit } = this;
        this.setPosition();
        this.__setThumbPosition();
        updateCanvas();
    };

    if (async) {
        requestAnimationFrame(update);
    } else {
        update();
    }
};