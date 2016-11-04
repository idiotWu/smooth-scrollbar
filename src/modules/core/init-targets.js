import {
    GLOBAL_ENV,
} from '../../contants/';

import {
    findChild,
    setStyle,
} from '../../helpers/';

import {
    setPrivateProp,
} from '../utils/';

import {
    update,
} from '../apis/';

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

    this::setPrivateProp('targets', {
        container, content,
        canvas: {
            elem: canvas,
            context: canvas.getContext('2d'),
        },
        xAxis: {
            track: trackX,
            thumb: findChild(trackX, 'scrollbar-thumb-x'),
        },
        yAxis: {
            track: trackY,
            thumb: findChild(trackY, 'scrollbar-thumb-y'),
        },
    });

    // observe
    if (typeof GLOBAL_ENV.MutationObserver !== 'function') {
        return;
    }

    const observer = new GLOBAL_ENV.MutationObserver(() => {
        this::update(true);
    });

    observer.observe(content, {
        childList: true,
    });

    this::setPrivateProp('observer', observer);
};
