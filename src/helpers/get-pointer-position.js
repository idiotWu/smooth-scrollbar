import { getPointerData } from './get-pointer-data';

/**
 * Get pointer/finger position
 * @param {object} evt - Event object
 * @return {object} - {x, y}
 */
export function getPointerPosition(evt) {
    const data = getPointerData(evt);

    return {
        x: data.clientX,
        y: data.clientY,
    };
};
