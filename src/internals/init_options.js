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
        thumbMinSize: 20,           // min size for scrollbar thumb
        renderByPixels: true,       // rendering by integer pixels
        overscrollEffect: 'iOS',    // overscroll effect, false | 'iOS' | 'android'
        continuousScrolling: 'auto' // allow uper scrollable content to scroll when reaching edge
    };

    const limit = {
        friction: [0, 100],
        speed: [0, Infinity],
        thumbMinSize: [0, Infinity],
        overscrollEffect: [false, 'iOS', 'android']
    };

    let isContinous = (mode = 'auto') => {
        if (!!options.overscrollEffect) return false;

        switch (mode) {
            case 'auto':
                return this.isNestedScrollbar;
            default:
                return !!mode;
        }
    };

    const optionAccessors = {
        // deprecated
        set ignoreEvents(v) {
            console.warn('`options.ignoreEvents` parameter is deprecated, use `instance#unregisterEvents()` method instead. https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceunregisterevents-regex--regex-regex--');
        },
        get renderByPixels() {
            return options.renderByPixels;
        },
        set renderByPixels(v) {
            options.renderByPixels = !!v;
        },
        get continuousScrolling() {
            return isContinous(options.continuousScrolling);
        },
        set continuousScrolling(v) {
            if (v === 'auto') {
                options.continuousScrolling = v;
            } else {
                options.continuousScrolling = !!v;
            }
        },
        get overscrollEffect() {
            return options.overscrollEffect;
        },
        set overscrollEffect(v) {
            if (v && !~limit.overscrollEffect.indexOf(v)) {
                console.warn(`\`overscrollEffect\` should be one of ${JSON.stringify(limit.overscrollEffect)}, but got ${JSON.stringify(v)}. It will be set to \`false\` now.`);

                v = false;
            }

            options.overscrollEffect = v;
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