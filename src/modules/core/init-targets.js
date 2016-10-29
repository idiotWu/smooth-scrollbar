import {
    findChild,
    setStyle,
} from '../../helpers/';

import {
    setPrivateProp,
} from '../utils/';

/**
 * Initialize targets map
 * @private
 * @param {element} container - Scrollbar container element
 */
export function initTargets(container) {
    // make container focusable
    container.setAttribute('tabindex', '1');

    // reset scroll position
    container.scrollTop = container.scrollLeft = 0;

    const content = findChild(container, 'scroll-content');
    const canvas = findChild(container, 'overscroll-glow');
    const trackX = findChild(container, 'scrollbar-track-x');
    const trackY = findChild(container, 'scrollbar-track-y');

    setStyle(container, {
        overflow: 'hidden',
        outline: 'none',
    });

    setStyle(canvas, {
        display: 'none',
        'pointer-events': 'none',
    });

    this::setPrivateProp('targets', Object.freeze({
        container, content,
        canvas: {
            elem: canvas,
            context: canvas.getContext('2d'),
        },
        xAxis: Object.freeze({
            track: trackX,
            thumb: findChild(trackX, 'scrollbar-thumb-x'),
        }),
        yAxis: Object.freeze({
            track: trackY,
            thumb: findChild(trackY, 'scrollbar-thumb-y'),
        }),
    }));
};
