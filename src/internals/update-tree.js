/**
 * @module
 * @prototype {Function} __updateTree
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { sbList, selectors } from '../shared/';

function __updateTree() {
    const { container, content } = this.targets;

    this.__readonly('children', [...content.querySelectorAll(selectors)]);
    this.__readonly('isNestedScrollbar', false);

    const parents = [];

    let elem = container;

    // eslint-disable-next-line no-cond-assign
    while (elem = elem.parentElement) {
        if (sbList.has(elem)) {
            this.__readonly('isNestedScrollbar', true);
            parents.push(elem);
        }
    }

    this.__readonly('parents', parents);
};

Object.defineProperty(SmoothScrollbar.prototype, '__updateTree', {
    value: __updateTree,
    writable: true,
    configurable: true,
});
