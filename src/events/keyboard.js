/**
 * @module
 * @prototype {Function} __keyboardHandler
 */

import { getOriginalEvent, pickInRange } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @internal
 * Keypress event handler builder
 *
 * @param {Object} option
 */
let __keyboardHandler = function() {
    const { targets, size, offset, limit, options } = this;

    let getKeyDelta = (keyCode) => {
        // key maps [deltaX, deltaY]
        switch (keyCode) {
            case 32: // space
                return [0, 200];
            case 33: // pageUp
                return [0, -size.container.height + 40];
            case 34: // pageDown
                return [0, size.container.height - 40];
            case 35: // end
                return [0, limit.y - offset.y];
            case 36: // home
                return [0, -offset.y];
            case 37: // left
                return [-40, 0];
            case 38: // up
                return [0, -40];
            case 39: // right
                return [40, 0];
            case 40: // down
                return [0, 40];
            default:
                return null;
        }
    };

    let isFocused = false;

    this.__addEvent(targets.container, 'focus', () => {
        isFocused = true;
    });

    this.__addEvent(targets.container, 'blur', () => {
        isFocused = false;
    });

    this.__addEvent(targets.container, 'keydown', (evt) => {
        if (!isFocused || this.__ignoreEvent(evt)) return;

        evt = getOriginalEvent(evt);

        let delta = getKeyDelta(evt.keyCode || evt.which);

        if (!delta) return;

        evt.preventDefault();

        const [x, y] = delta;

        this.__addMovement(x * options.speed, y * options.speed);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__keyboardHandler', {
    value: __keyboardHandler,
    writable: true,
    configurable: true
});
