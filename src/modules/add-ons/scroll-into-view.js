import {
    getPrivateProp,
} from '../namespace/';

import {
    setMovement,
} from '../movement/';

import { isVisible } from './is-visible';

/**
 * Scroll target element into visible area of scrollbar.
 * @public
 * @param {element} target - target element
 * @param {boolean} options.onlyScrollIfNeeded - whether scroll container when target element is visible
 * @param {number} options.offsetTop - scrolling stop offset to top
 * @param {number} options.offsetLeft - scrolling stop offset to left
 */
export function scrollIntoView(elem, {
    onlyScrollIfNeeded = false,
    offsetTop = 0,
    offsetLeft = 0,
} = {}) {
    const {
        targets,
        bounding,
    } = this::getPrivateProp();

    if (!elem || !targets.container.contains(elem)) return;

    const targetBounding = elem.getBoundingClientRect();

    if (onlyScrollIfNeeded && this::isVisible(elem)) return;

    this::setMovement(
        targetBounding.left - bounding.left - offsetLeft,
        targetBounding.top - bounding.top - offsetTop,
    );
};
