/**
 * @module
 * @prototype {Function} destroy
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { setStyle } from '../utils';
import { sbList } from '../shared';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Remove all scrollbar listeners and event handlers
 * Reset
 */
SmoothScrollbar.prototype.destroy = function() {
    const { __listeners, __handlers, targets } = this;
    const { container, content } = targets;

    __handlers.forEach(({ evt, elem, handler }) => {
        elem.removeEventListener(evt, handler);
    });

    this.scrollTo(0, 0, 300, () => {
        cancelAnimationFrame(this.__timerID.scrollAnimation);
        __handlers.length = __listeners.length = 0;

        // reset scroll position
        setStyle(container, {
            overflow: ''
        });

        container.scrollTop = container.scrollLeft = 0;

        // reset content
        const children = [...content.children];

        container.innerHTML = '';

        children.forEach((el) => container.appendChild(el));

        // remove form sbList
        sbList.delete(container);
    });
};