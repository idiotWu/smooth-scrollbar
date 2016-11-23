import {
    getPrivateProp,
} from '../namespace/';

/**
 * Stop scrolling
 * @public
 * @api
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
