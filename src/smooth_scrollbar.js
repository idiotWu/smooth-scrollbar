/**
 * @module
 * @export {Class} SmoothScrollbar
 */

import { sbList, GLOBAL_TOUCHES } from './shared/';
import {
    pickInRange,
    debounce,
    findChild,
    setStyle
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

        const canvas = findChild(container, 'scrollbar-effect');
        const trackX = findChild(container, 'scrollbar-track-x');
        const trackY = findChild(container, 'scrollbar-track-y');

        setStyle(container, {
            overflow: 'hidden',
            outline: 'none'
        });

        setStyle(canvas, {
            display: 'none',
            'pointer-events': 'nonw'
        });

        // readonly properties
        this.__readonly('targets', Object.freeze({
            container,
            content: findChild(container, 'scroll-content'),
            canvas: {
                elem: canvas,
                context: canvas.getContext('2d')
            },
            xAxis: Object.freeze({
                track: trackX,
                thumb: findChild(trackX, 'scrollbar-thumb-x')
            }),
            yAxis: Object.freeze({
                track: trackY,
                thumb: findChild(trackY, 'scrollbar-thumb-y')
            })
        }))
        .__readonly('offset', {
            x: 0,
            y: 0
        })
        .__readonly('thumbOffset', {
            x: 0,
            y: 0
        })
        .__readonly('limit', {
            x: Infinity,
            y: Infinity
        })
        .__readonly('movement', {
            x: 0,
            y: 0
        })
        .__readonly('movementLocked', {
            x: false,
            y: false
        })
        .__readonly('overscrollRendered', {
            x: 0,
            y: 0
        })
        .__readonly('overscrollBack', false)
        .__readonly('thumbSize', {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0
        })
        .__readonly('bounding', {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        })
        .__readonly('children', [])
        .__readonly('parents', [])
        .__readonly('size', this.getSize())
        .__readonly('isNestedScrollbar', false);

        // non-enmurable properties
        Object.defineProperties(this, {
            __updateThrottle: {
                value: debounce(::this.update)
            },
            __hideTrackThrottle: {
                value: debounce(::this.hideTrack, 300, false)
            },
            __listeners: {
                value: []
            },
            __handlers: {
                value: []
            },
            __children: {
                value: []
            },
            __timerID: {
                value: {}
            }
        });

        this.__initOptions(options);
        this.__initScrollbar();

        // storage
        sbList.set(container, this);
    }

    get MAX_OVERSCROLL() {
        const { options, size } = this;

        switch (options.overscrollEffect) {
            case 'bounce':
                const average = (size.container.width + size.container.height) / 2;

                return GLOBAL_TOUCHES.TOUCH_SUPPORTED ?
                        pickInRange(average / 2, 100, 1000) :
                        pickInRange(average / 10, 25, 50);

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