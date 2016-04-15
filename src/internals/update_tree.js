/**
 * @module
 * @prototype {Function} __updateTree
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { sbList, selectors } from '../shared/';

export { SmoothScrollbar };

function __updateTree() {
    let { container, content } = this.targets;

    this.__readonly('children', [...content.querySelectorAll(selectors)]);
    this.__readonly('isNestedScrollbar', false);

    while (container) {
        container = container.parentElement;

        if (sbList.has(container)) {
            this.__readonly('isNestedScrollbar', true);
            return;
        }
    }
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateTree', {
    value: __updateTree,
    writable: true,
    configurable: true
});
