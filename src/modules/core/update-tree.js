import {
    ScbList,
    SELECTOR,
} from '../../contants/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

/**
 * Update scrollbars tree
 * @private
 */
export function updateTree() {
    const {
        container,
        content,
    } = this::getPrivateProp('targets');

    const parents = [];

    let isNested = false;
    let elem = container;

    // eslint-disable-next-line no-cond-assign
    while (elem = elem.parentElement) {
        if (ScbList.has(elem)) {
            isNested = true;
            parents.push(elem);
        }
    }

    this::setPrivateProp({
        parents,
        isNestedScrollbar: isNested,
        children: [...content.querySelectorAll(SELECTOR)],
    });
};
