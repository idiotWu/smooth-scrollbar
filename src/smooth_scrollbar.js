/**
 * @module
 * @export {Class} SmoothScrollbar
 */

import { DEFAULT_OPTIONS } from './options';
import { sbList } from './shared/sb_list';
import {
    debounce,
    findChild,
    setStyle
} from './utils/index';

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
        .__readonly('size', this.getSize())
        .__readonly('options', Object.assign({}, DEFAULT_OPTIONS));

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

        this.setOptions(options);
        this.__initScrollbar();
    }
}