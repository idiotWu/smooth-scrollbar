/**
 * @module
 * @prototype {Function} __updateTree
 */

import { SmoothScrollbar } from '../smooth_scrollbar';
import { sbList, selectors } from '../shared/';

function __updateTree() {
    const { container, content } = this.targets;

    this.__readonly('children', [...content.querySelectorAll(selectors)]);
    this.__readonly('isNestedScrollbar', false);

    const parents = [];

    let elem = container;

    while (elem = elem.parentElement) {
        if (sbList.has(container)) {
            this.__readonly('isNestedScrollbar', true);
            parents.push(container);
        }
    }

    this.__readonly('parents', parents);
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateTree', {
    value: __updateTree,
    writable: true,
    configurable: true
});
