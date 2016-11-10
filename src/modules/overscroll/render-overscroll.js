import {
    pickInRange,
} from '../../helpers/';

import {
    GLOBAL_ENV,
    OVERSCROLL_GLOW,
    OVERSCROLL_BOUNCE,
} from '../../contants/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

import { isMovementLocked } from './movement-lock';
import { overscrollBounce } from './bounce';
import { overscrollGlow } from './glow';

/**
 * Overscroll rendering
 * @private
 * @param  {string[]} [dirs] - Render direction, values within ['x', 'y']
 */
export function renderOverscroll(dirs = []) {
    const {
        options,
        overscrollRendered,
    } = this::getPrivateProp();

    if (!dirs.length || !options.overscrollEffect) return;

    const nextFrame = { ...overscrollRendered };

    dirs.forEach(dir => {
        nextFrame[dir] = this::_calcNextOverflow(dir);
    });

    if (!this::_shouldUpdate(nextFrame)) return;

    // x,y is same direction as it's in `setPosition(x, y)`
    switch (options.overscrollEffect) {
        case OVERSCROLL_BOUNCE:
            this::overscrollBounce(nextFrame.x, nextFrame.y);
            break;
        case OVERSCROLL_GLOW:
            this::overscrollGlow(nextFrame.x, nextFrame.y);
            break;
        default:
            break;
    }

    this::setPrivateProp('overscrollRendered', nextFrame);
};

function _calcNextOverflow(dir = '') {
    if (!dir) return;

    const {
        options,
        movement,
        overscrollRendered,
        MAX_OVERSCROLL,
    } = this::getPrivateProp();

    const dest = movement[dir] = pickInRange(movement[dir], -MAX_OVERSCROLL, MAX_OVERSCROLL);
    const damping = options.overscrollDamping;

    let next = overscrollRendered[dir] + (dest - overscrollRendered[dir]) * damping;

    if (options.renderByPixels) {
        next |= 0;
    }

    if (!this::isMovementLocked() && Math.abs(next - overscrollRendered[dir]) < 0.1) {
        next -= (dest / Math.abs(dest || 1));
    }

    if (Math.abs(next) < Math.abs(overscrollRendered[dir])) {
        this::setPrivateProp('overscrollBack', true);
    }

    if (next * overscrollRendered[dir] < 0 || Math.abs(next) <= 1) {
        next = 0;
        this::setPrivateProp('overscrollBack', false);
    }

    // overscrollRendered[dir] = next;
    return next;
}

function _shouldUpdate(nextFrame) {
    const {
        touchRecord,
        overscrollRendered,
    } = this::getPrivateProp();

    // has unrendered pixels?
    if (overscrollRendered.x !== nextFrame.x ||
        overscrollRendered.y !== nextFrame.y) return true;

    // is touch position updated?
    if (GLOBAL_ENV.TOUCH_SUPPORTED &&
        touchRecord.updatedRecently()) return true;

    return false;
}
