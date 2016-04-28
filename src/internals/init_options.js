/**
 * @module
 * @prototype {Function} __initOptions
 */

import { pickInRange } from '../utils/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __initOptions(userPreference) {
    const options = {
        speed: 1,                   // scroll speed scale
        friction: 10,               // friction factor, percent
        ignoreEvents: [],           // events names to be ignored
        thumbMinSize: 20,           // min size for scrollbar thumb
        renderByPixels: true,       // rendering by integer pixels
        continuousScrolling: 'auto' // allow uper scrollable content to scroll when reaching edge
    };

    const limit = {
        friction: [0, 100],
        speed: [0, Infinity],
        thumbMinSize: [0, Infinity]
    };

    let getScrollMode = (mode = 'auto') => {
        switch (mode) {
            case 'auto':
                return this.isNestedScrollbar;
            default:
                return !!mode;
        }
    };

    const optionAccessors = {
        get renderByPixels() {
            return options.renderByPixels;
        },
        set renderByPixels(v) {
            options.renderByPixels = !!v;
        },
        get ignoreEvents() {
            return options.ignoreEvents;
        },
        set ignoreEvents(v) {
            if (!Array.isArray(v)) {
                throw new TypeError(`expect \`options.ignoreEvents\` to be a number, but got ${typeof v}`);
            }

            options.ignoreEvents = v;
        },
        get continuousScrolling() {
            return getScrollMode(options.continuousScrolling);
        },
        set continuousScrolling(v) {
            if (v === 'auto') {
                options.continuousScrolling = v;
            } else {
                options.continuousScrolling = !!v;
            }
        }
    };

    Object.keys(options)
        .filter((prop) => !optionAccessors.hasOwnProperty(prop))
        .forEach((prop) => {
            Object.defineProperty(optionAccessors, prop, {
                enumerable: true,
                get() {
                    return options[prop];
                },
                set(v) {
                    if (isNaN(parseFloat(v))) {
                        throw new TypeError(`expect \`options.${prop}\` to be a number, but got ${typeof v}`);
                    }

                    options[prop] = pickInRange(v, ...limit[prop]);
                }
            });
        });

    this.__readonly('options', optionAccessors);
    this.setOptions(userPreference);
};

Object.defineProperty(SmoothScrollbar.prototype, '__initOptions', {
    value: __initOptions,
    writable: true,
    configurable: true
});