import {
    GLOBAL_ENV,
    PRIVATE_PROPS,
    PRIVATE_METHODS,
    OVERSCROLL_GLOW,
    OVERSCROLL_BOUNCE,
} from '../../contants/';

import {
    debounce,
    pickInRange,
    TouchRecord,
} from '../../helpers/';

import {
    setPrivateProp,
    getPrivateProp,
    definePrivateMethod,
} from '../utils/';

import {
    isMovementLocked,
} from '../overscroll/';

import {
    update,
} from '../metrics/';

import {
    hideTrack,
} from '../render/';

/**
 * Initialize private props&methods
 * @private
 */
export function initPrivates() {
    const scb = this;

    Object.defineProperties(this, {
        [PRIVATE_PROPS]: {
            value: {},
        },
        [PRIVATE_METHODS]: {
            value: {},
        },
    });

    // private properties
    this::setPrivateProp({
        get MAX_OVERSCROLL() {
            const {
                options,
                size,
            } = scb::getPrivateProp();

            switch (options.overscrollEffect) {
                case OVERSCROLL_BOUNCE:
                    const diagonal = Math.floor(Math.sqrt(size.container.width ** 2 + size.container.height ** 2));
                    const touchFactor = scb::isMovementLocked() ? 2 : 10;

                    return GLOBAL_ENV.TOUCH_SUPPORTED ?
                        pickInRange(diagonal / touchFactor, 100, 1000) :
                        pickInRange(diagonal / 10, 25, 50);

                case OVERSCROLL_GLOW:
                    return 150;

                default:
                    return 0;
            }
        },
    })
    ::setPrivateProp({
        children: [],
        parents: [],
        isDraging: false,
        overscrollBack: false,
        isNestedScrollbar: false,
        touchRecord: new TouchRecord(),
        scrollListeners: [],
        eventHandlers: [],
        timerID: {},
        size: {
            container: {
                width: 0,
                height: 0,
            },
            content: {
                width: 0,
                height: 0,
            },
        },
        offset: {
            x: 0,
            y: 0,
        },
        thumbOffset: {
            x: 0,
            y: 0,
        },
        limit: {
            x: Infinity,
            y: Infinity,
        },
        movement: {
            x: 0,
            y: 0,
        },
        movementLocked: {
            x: false,
            y: false,
        },
        overscrollRendered: {
            x: 0,
            y: 0,
        },
        thumbSize: {
            x: 0,
            y: 0,
            realX: 0,
            realY: 0,
        },
        bounding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        },
    });

    // private methods
    this::definePrivateMethod({
        hideTrackDebounce: debounce(this::hideTrack, 1000, false),
        updateDebounce: debounce(this::update),
    });
}
