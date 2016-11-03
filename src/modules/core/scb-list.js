import {
    SELECTOR,
} from '../../contants/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

class ScrollbarStore extends Map {
    static get [Symbol.species]() {
        return Map;
    }

    /**
     * Update scrollbars tree
     * @param  {Scrollbar} scb - target scrollbar instance
     */
    updateScbTree(scb) {
        const {
            container,
            content,
        } = scb::getPrivateProp('targets');

        const parents = [];

        let isNested = false;
        let elem = container;

        // eslint-disable-next-line no-cond-assign
        while (elem = elem.parentElement) {
            if (this.has(elem)) {
                isNested = true;
                parents.push(this.get(elem));
            }
        }

        scb::setPrivateProp({
            parents,
            isNestedScrollbar: isNested,
            children: Array.from(content.querySelectorAll(SELECTOR), ::this.get),
        });
    }

    update() {
        this.forEach(::this.updateScbTree);
    }

    // patch #set,#delete with #update method
    delete(...args) {
        const res = super.delete(...args);
        this.update();

        return res;
    }

    set(...args) {
        const res = super.set(...args);
        this.update();

        return res;
    };
}

export const ScbList = new ScrollbarStore();
