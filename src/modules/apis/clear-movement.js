import {
    getPrivateProp,
} from '../utils/';

/**
 * Stop scrolling
 * @public
 */
export function stop() {
    const {
        movement,
        timerID,
    } = this::getPrivateProp();

    movement.x = movement.y = 0;
    cancelAnimationFrame(timerID.scrollTo);
};

export const clearMovement = stop;
