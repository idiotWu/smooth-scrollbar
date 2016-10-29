import {
    setStyle,
} from '../../helpers/';

import {
    setPrivateProp,
    getPrivateProp,
} from '../utils/';

import {
    updateBounding,
    updateThumbPosition,
} from '../dom/';

import { getSize } from './get-size';
import { setPosition } from './set-position';

/**
 * Update scrollbars appearance
 * @public
 * @param {Boolean} inAsync: update asynchronous
 */
export function update(inAsync) {
    if (inAsync) {
        requestAnimationFrame(this::renew);
    } else {
        this::renew();
    }
};

/**
 * Update canvas size
 */
function updateCanvas() {
    const {
        options,
        targets,
        size,
    } = this::getPrivateProp();

    if (options.overscrollEffect !== 'glow') return;

    const {
        elem,
        context,
    } = targets.canvas;

    const DPR = window.devicePixelRatio || 1;

    const nextWidth = size.container.width * DPR;
    const nextHeight = size.container.height * DPR;

    if (nextWidth === elem.width && nextHeight === elem.height) {
        return;
    }

    elem.width = nextWidth;
    elem.height = nextHeight;

    context.scale(DPR, DPR);
};

/**
 * @this-binding
 *
 * Update scrollbar track and thumb
 */
function updateTrack() {
    const {
        size,
        thumbSize,
        targets,
    } = this::getPrivateProp();

    const {
        xAxis,
        yAxis,
    } = targets;

    // hide scrollbar if content size less than container
    setStyle(xAxis.track, {
        'display': size.content.width <= size.container.width ? 'none' : 'block',
    });
    setStyle(yAxis.track, {
        'display': size.content.height <= size.container.height ? 'none' : 'block',
    });

    // use percentage value for thumb
    setStyle(xAxis.thumb, {
        'width': `${thumbSize.x}px`,
    });
    setStyle(yAxis.thumb, {
        'height': `${thumbSize.y}px`,
    });
}

/**
 * Re-calculate sizes:
 *     1. offset limit
 *     2. thumb sizes
 */
function renew() {
    const {
        options,
    } = this::getPrivateProp();

    this::updateBounding();

    const size = this::getSize();

    const newLimit = {
        x: Math.max(size.content.width - size.container.width, 0),
        y: Math.max(size.content.height - size.container.height, 0),
    };

    const thumbSize = {
        // real thumb sizes
        realX: size.container.width / size.content.width * size.container.width,
        realY: size.container.height / size.content.height * size.container.height,
    };

    // rendered thumb sizes
    thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
    thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);

    this::setPrivateProp({
        size, thumbSize,
        limit: newLimit,
    });

    // update appearance
    this::updateTrack();
    this::updateCanvas();

    // re-positioning
    this::setPosition();
    this::updateThumbPosition();
};
