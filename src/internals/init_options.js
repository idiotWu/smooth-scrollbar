/**
 * @module
 * @prototype {Function} __initOptions
 */

import { pickInRange } from '../utils/';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function __initOptions(opt = {}) {
    const options = {
        speed: 1,        // scroll speed scale
        fricton: 10,     // fricton factor, percent
        ignoreEvents: [] // events names to be ignored
    };

    const limit = {
        fricton: [1, 99],
        speed: [0, Infinity]
    };

    this.__readonly('options', {
        get ignoreEvents() {
            return options.ignoreEvents;
        },
        set ignoreEvents(v) {
            if (!Array.isArray(v)) {
                throw new TypeError(`expect \`options.ignoreEvents\` to be a number, but got ${typeof v}`);
            }

            options.ignoreEvents = v;
        },

        get speed() {
            return options.speed;
        },
        set speed(v) {
            if (isNaN(parseFloat(v))) {
                throw new TypeError(`expect \`options.speed\` to be a number, but got ${typeof v}`);
            }

            options.speed = pickInRange(v, ...limit.speed);
        },

        get fricton() {
            return options.fricton;
        },
        set fricton(v) {
            if (isNaN(parseFloat(v))) {
                throw new TypeError(`expect \`options.fricton\` to be a number, but got ${typeof v}`);
            }

            options.fricton = pickInRange(v, ...limit.fricton);
        },
    });

    Object.assign(this.options, opt);
};

Object.defineProperty(SmoothScrollbar.prototype, '__initOptions', {
    value: __initOptions,
    writable: true,
    configurable: true
});