import {
    SELECTOR,
} from '../../contants/';

import {
    toArray,
} from '../../helpers/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../namespace/';

class ScrollbarStore {
    constructor() {
        this.store = [];
    }

    _getMap(elem) {
        const { store } = this;

        for (let i = 0, max = store.length; i < max; i++) {
            if (store[i].elem === elem) {
                return store[i];
            }
        }
    }

    set(elem, scrollbar) {
        const exist = this._getMap(elem);

        if (exist) {
            exist.scrollbar = scrollbar;
        } else {
            this.store.push({ elem, scrollbar });
        }

        this._update();
    }

    get(elem) {
        const exist = this._getMap(elem);

        return exist ? exist.scrollbar : null;
    }

    getAll() {
        return this.store.map(({ scrollbar }) => scrollbar);
    }

    has(elem) {
        return !!this._getMap(elem);
    }

    delete(elem) {
        const { store } = this;

        for (let i = 0, max = store.length; i < max; i++) {
            if (store[i].elem === elem) {
                store.splice(i, 1);
                this._update();
                return;
            }
        }
    }

    _update() {
        this.store.forEach(({ scrollbar }) => {
            this._updateScbTree(scrollbar);
        });
    }

    /**
     * Update scrollbars tree
     * @param {Scrollbar} scrollbar - target scrollbar instance
     */
    _updateScbTree(scrollbar) {
        const {
            container,
            content,
        } = scrollbar::getPrivateProp('targets');

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

        scrollbar::setPrivateProp({
            parents,
            isNestedScrollbar: isNested,
            children: toArray(content.querySelectorAll(SELECTOR), ::this.get),
        });
    }
}

export const ScbList = new ScrollbarStore();
