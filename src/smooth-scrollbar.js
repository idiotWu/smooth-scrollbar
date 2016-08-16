/**
 * @module
 * @export {Class} SmoothScrollbar
 */

import { sbList, GLOBAL_ENV } from './shared/';
import {
    TouchRecord,
    pickInRange,
    debounce,
    findChild,
    setStyle,
} from './utils/';

/**
 * @constructor
 * Create scrollbar instance
 *
 * @param {Element} container: target element
 * @param {Object} [options]: options
 */
export class SmoothScrollbar {
    constructor(container, options = {}) {
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

        // readonly properties
        this.__readonly('targets', Object.freeze({
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
        }))
        .__readonly('offset', {
            x: 0,
            y: 0,
        })
        .__readonly('thumbOffset', {
            x: 0,
            y: 0,
        })
        .__readonly('limit', {
            x: Infinity,
            y: Infinity,
        })
        .__readonly('movement', {
            x: 0,
            y: 0,
        })
        .__readonly('movementLocked', {
            x: false,
            y: false,
        })
        .__readonly('overscrollRendered', {
            x: 0,
            y: 0,
        })
        .__readonly('overscrollBack', false)
        .__readonly('thumbSize', {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0,
        })
        .__readonly('bounding', {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        })
        .__readonly('children', [])
        .__readonly('parents', [])
        .__readonly('size', this.getSize())
        .__readonly('isNestedScrollbar', false);

        // non-enmurable properties
        Object.defineProperties(this, {
            __hideTrackThrottle: {
                value: debounce(::this.hideTrack, 1000, false),
            },
            __updateThrottle: {
                value: debounce(::this.update),
            },
            __touchRecord: {
                value: new TouchRecord(),
            },
            __listeners: {
                value: [],
            },
            __handlers: {
                value: [],
            },
            __children: {
                value: [],
            },
            __timerID: {
                value: {},
            },
        });

        this.__initOptions(options);
        this.__initScrollbar();

        // storage
        sbList.set(container, this);

        // observe
        if (typeof GLOBAL_ENV.MutationObserver === 'function') {
            // observe
            const observer = new GLOBAL_ENV.MutationObserver(() => {
                this.update(true);
            });

            observer.observe(content, {
                childList: true,
            });

            Object.defineProperty(this, '__observer', {
                value: observer,
            });
        }
    }

    get MAX_OVERSCROLL() {
        const { options, size } = this;

        switch (options.overscrollEffect) {
        case 'bounce':
            const diagonal = Math.floor(Math.sqrt(size.container.width ** 2 + size.container.height ** 2));
            const touchFactor = this.__isMovementLocked() ? 2 : 10;

            return GLOBAL_ENV.TOUCH_SUPPORTED ? pickInRange(diagonal / touchFactor, 100, 1000) : pickInRange(diagonal / 10, 25, 50);

        case 'glow':
            return 150;

        default:
            return 0;
        }
    }

    get scrollTop() {
        return this.offset.y;
    }

    get scrollLeft() {
        return this.offset.x;
    }
}
