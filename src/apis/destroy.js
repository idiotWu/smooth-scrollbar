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

    __handlers.forEach(({ evt, elem, fn }) => {
        elem.removeEventListener(evt, fn);
    });

    __handlers.length = __listeners.length = 0;

    this.scrollTo(0, 0, 300, () => {
        // stop render
        cancelAnimationFrame(this.__timerID.render);

        // remove form sbList
        sbList.delete(container);

        // check if element has been removed from DOM
        if (!container.parentNode) {
            return;
        }

        // reset scroll position
        setStyle(container, {
            overflow: ''
        });

        container.scrollTop = container.scrollLeft = 0;

        // reset content
        const childNodes = [...content.childNodes];

        container.innerHTML = '';

        childNodes.forEach((el) => container.appendChild(el));
    });
};
