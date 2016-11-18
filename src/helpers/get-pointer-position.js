/**
 * Get pointer/finger position
 * @param {object} pointer - event object or touch object
 * @return {object} - {x, y}
 */
export function getPointerPosition(pointer) {
    return {
        x: pointer.clientX,
        y: pointer.clientY,
    };
};
