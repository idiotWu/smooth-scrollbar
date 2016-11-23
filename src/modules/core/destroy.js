import {
    setStyle,
    toArray,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../namespace/';

import {
    clearMovement,
} from '../movement/';

import {
    scrollTo,
} from '../render/';

import {
    ScbList,
} from './scb-list';

/**
 * Remove all scrollbar listeners and event handlers
 * @public
 * @param {boolean} isRemoval - Whether node is being removed from DOM
 */
export function destroy(isRemoval) {
    const {
        scrollListeners,
        eventHandlers,
        observer,
        targets,
        timerID,
    } = this::getPrivateProp();

    const {
        container,
        content,
    } = targets;

    // remove handlers
    eventHandlers.forEach(({ evt, elem, fn }) => {
        elem.removeEventListener(evt, fn);
    });

    eventHandlers.length = scrollListeners.length = 0;

    // stop render
    this::clearMovement();
    cancelAnimationFrame(timerID.render);

    // stop observe
    if (observer) {
        observer.disconnect();
    }

    // remove form scrollbars list
    ScbList.delete(container);

    if (isRemoval) return;

    // restore DOM
    this::scrollTo(0, 0, 300, () => {
        // check if element has been removed from DOM
        if (!container.parentNode) {
            return;
        }

        // reset scroll position
        setStyle(container, {
            overflow: '',
        });

        container.scrollTop = container.scrollLeft = 0;

        // reset content
        const childNodes = toArray(content.childNodes);

        container.innerHTML = '';

        childNodes.forEach((el) => container.appendChild(el));
    });
};
