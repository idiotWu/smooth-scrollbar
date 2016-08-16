/**
 * @module
 * @prototype {Function} destroy
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { setStyle } from '../utils';
import { sbList } from '../shared';

/**
 * @method
 * @api
 * Remove all scrollbar listeners and event handlers
 *
 * @param {Boolean} isRemoval: whether node is removing from DOM
 */
SmoothScrollbar.prototype.destroy = function (isRemoval) {
    const {
        __listeners,
        __handlers,
        __observer,
        targets,
    } = this;

    const {
        container,
        content,
    } = targets;

    // remove handlers
    __handlers.forEach(({ evt, elem, fn }) => {
        elem.removeEventListener(evt, fn);
    });

    __handlers.length = __listeners.length = 0;

    // stop render
    this.stop();
    cancelAnimationFrame(this.__timerID.render);

    // stop observe
    if (__observer) {
        __observer.disconnect();
    }

    // remove form sbList
    sbList.delete(container);

    if (isRemoval) return;

    // restore DOM
    this.scrollTo(0, 0, 300, () => {
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
        const childNodes = [...content.childNodes];

        container.innerHTML = '';

        childNodes.forEach((el) => container.appendChild(el));
    });
};
