import {
    getPrivateProp,
    callPrivateMethod,
} from '../utils/';

import {
    addEvent,
} from '../dom/';

import {
    willOverscroll,
} from '../overscroll/';

import {
    addMovement,
    unlockMovement,
    shouldPropagateMovement,
} from '../render/';

const KEY_CODE = {
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

/**
 * Keyboard events handlers
 * @private
 */
export function handleKeyboardEvents() {
    const {
        targets,
    } = this::getPrivateProp();

    const getKeyDelta = (keyCode) => {
        // need real time data
        const {
            size,
            offset,
            limit,
            movement,
        } = this::getPrivateProp();

        switch (keyCode) {
            case KEY_CODE.SPACE:
                return [0, 200];
            case KEY_CODE.PAGE_UP:
                return [0, -size.container.height + 40];
            case KEY_CODE.PAGE_DOWN:
                return [0, size.container.height - 40];
            case KEY_CODE.END:
                return [0, Math.abs(movement.y) + limit.y - offset.y];
            case KEY_CODE.HOME:
                return [0, -Math.abs(movement.y) - offset.y];
            case KEY_CODE.LEFT:
                return [-40, 0];
            case KEY_CODE.UP:
                return [0, -40];
            case KEY_CODE.RIGHT:
                return [40, 0];
            case KEY_CODE.DOWN:
                return [0, 40];
            default:
                return null;
        }
    };

    const { container } = targets;

    let isFocused = false;

    this::addEvent(container, 'focus', () => {
        isFocused = true;
    });

    this::addEvent(container, 'blur', () => {
        isFocused = false;
    });

    this::addEvent(container, 'keydown', (evt) => {
        if (!isFocused) return;

        const {
            options,
            parents,
            movementLocked,
        } = this::getPrivateProp();

        const delta = getKeyDelta(evt.keyCode || evt.which);

        if (!delta) return;

        const [x, y] = delta;

        if (this::shouldPropagateMovement(x, y)) {
            container.blur();

            if (parents.length) {
                parents[0].focus();
            }

            return this::callPrivateMethod('updateDebounce');
        }

        evt.preventDefault();

        this::unlockMovement(); // handle for multi keypress
        if (x && this::willOverscroll('x', x)) movementLocked.x = true;
        if (y && this::willOverscroll('y', y)) movementLocked.y = true;

        const { speed } = options;
        this::addMovement(x * speed, y * speed);
    });

    this::addEvent(container, 'keyup', () => {
        this::unlockMovement();
    });
};
