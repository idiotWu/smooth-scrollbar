/**
 * @module
 * @export {Class} SmoothScrollbar
 */

import { sbList } from './shared/';
import {
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
        sbList.set(container, this);

        // make container focusable
        container.setAttribute('tabindex', '1');

        // reset scroll position
        container.scrollTop = container.scrollLeft = 0;

        setStyle(container, {
            overflow: 'hidden',
            outline: 'none'
        });

        const trackX = findChild(container, 'scrollbar-track-x');
        const trackY = findChild(container, 'scrollbar-track-y');

        // readonly properties
        this.__readonly('targets', Object.freeze({
            container,
            content: findChild(container, 'scroll-content'),
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
        .__readonly('limit', {
            x: Infinity,
            y: Infinity
        })
        .__readonly('movement', {
            x: 0,
            y: 0
        })
        .__readonly('thumbSize', {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0
        })
        .__readonly('size', this.getSize());

        // non-enmurable properties
        Object.defineProperties(this, {
            __updateThrottle: {
                value: debounce(::this.update)
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

        // accessors
        Object.defineProperties(this, {
            scrollTop: {
                get() {
                    return this.offset.y;
                }
            },
            scrollLeft: {
                get() {
                    return this.offset.x;
                }
            }
        });

        this.__initOptions(options);
        this.__initScrollbar();
    }
}