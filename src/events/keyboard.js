/**
 * @module
 * @prototype {Function} __keyboardHandler
 */

import { getOriginalEvent, pickInRange } from '../utils/index';
import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

// key maps [deltaX, deltaY]
const KEYMAPS = {
    32: [0, 5],   // space
    37: [-1, 0],  // left
    38: [0, -1],  // up
    39: [1, 0],   // right
    40: [0, 1]    // down
};

/**
 * @method
 * @internal
 * Keypress event handler builder
 *
 * @param {Object} option
 */
let __keyboardHandler = function() {
    const { container } = this.targets;
    let isFocused = false;

    this.__addEvent(container, 'focus', () => {
        isFocused = true;
    });

    this.__addEvent(container, 'blur', () => {
        isFocused = false;
    });

    this.__addEvent(container, 'keydown', (evt) => {
        if (!isFocused || this.__ignoreEvent(evt)) return;

        evt = getOriginalEvent(evt);

        const keyCode = evt.keyCode || evt.which;

        if (!KEYMAPS.hasOwnProperty(keyCode)) return;

        evt.preventDefault();

        const { speed } = this.options;
        const [x, y] = KEYMAPS[keyCode];

        this.__addMovement(x * 40, y * 40);
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__keyboardHandler', {
    value: __keyboardHandler,
    writable: true,
    configurable: true
});
