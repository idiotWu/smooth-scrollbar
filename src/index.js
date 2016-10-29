import {
    ScbList,
    SELECTOR,
} from './contants/';

import {
    initScrollbar,
} from './modules/core/';

import {
    getPrivateProp,
} from './modules/utils/';

import {
    clearMovement,
    stop,
    destroy,
    getContentElem,
    getSize,
    infiniteScroll,
    isVisible,
    addListener,
    removeListener,
    registerEvents,
    unregisterEvents,
    scrollIntoView,
    scrollTo,
    setOptions,
    setPosition,
    showTrack,
    hideTrack,
    update,
} from './modules/apis/';

import './style/smooth-scrollbar.styl';

export default class SmoothScrollbar {
    /**
     * Create scrollbar instance
     * @constructor
     * @param {element} container - target element
     * @param {object} [options] - options
     */
    constructor(container, options) {
        this::initScrollbar(container, options);

        // storage
        ScbList.set(container, this);
    }

    // eslint-disable-next-line spaced-comment
    /******************* Alias *******************/
    get targets() {
        return this::getPrivateProp('targets');
    }

    get offset() {
        return this::getPrivateProp('offset');
    }

    get limit() {
        return this::getPrivateProp('limit');
    }

    get contentElement() {
        return this.targets.content;
    }

    get scrollTop() {
        return this.offset.y;
    }

    get scrollLeft() {
        return this.offset.x;
    }

    // eslint-disable-next-line spaced-comment
    /******************* Static Methods *******************/
    static version = __SCROLLBAR_VERSION__;

    /**
     * Initialize scrollbar on given element
     * @static
     * @param {element} elem - Target element
     * @param {object} options - Scrollbar options
     * @return {SmoothScrollbar}
     */
    static init(elem, options) {
        if (!elem || elem.nodeType !== 1) {
            throw new TypeError(`expect element to be DOM Element, but got ${typeof elem}`);
        }

        if (ScbList.has(elem)) return ScbList.get(elem);

        elem.setAttribute('data-scrollbar', '');

        const childNodes = [...elem.childNodes];

        const div = document.createElement('div');

        div.innerHTML = `
            <article class="scroll-content"></article>
            <aside class="scrollbar-track scrollbar-track-x">
                <div class="scrollbar-thumb scrollbar-thumb-x"></div>
            </aside>
            <aside class="scrollbar-track scrollbar-track-y">
                <div class="scrollbar-thumb scrollbar-thumb-y"></div>
            </aside>
            <canvas class="overscroll-glow"></canvas>
        `;

        const scrollContent = div.querySelector('.scroll-content');

        [...div.childNodes].forEach((el) => elem.appendChild(el));

        childNodes.forEach((el) => scrollContent.appendChild(el));

        return new SmoothScrollbar(elem, options);
    };

    /**
     * init scrollbars on pre-defined selectors
     * @static
     * @param {object} options - scrollbar options
     * @return {SmoothScrollbar[]} - a collection of scrollbar instances
     */
    static initAll(options) {
        return [...document.querySelectorAll(SELECTOR)].map((el) => {
            return SmoothScrollbar.init(el, options);
        });
    };

    /**
     * Check if scrollbar exists on given element
     * @static
     * @param {element} elem - Container element
     * @return {boolean}
     */
    static has(elem) {
        return ScbList.has(elem);
    };

    /**
     * Get scrollbar instance through given element
     * @static
     * @param {element} elem - Container element
     * @return {SmoothScrollbar}
     */
    static get(elem) {
        return ScbList.get(elem);
    };

    /**
     * Get all scrollbar instances
     * @static
     * @return {SmoothScrollbar[]} - a collection of scrollbars
     */
    static getAll() {
        return [...ScbList.values()];
    };

    /**
     * Destroy scrollbar on given element
     * @static
     * @param {element} elem - target scrollbar container
     * @param {boolean} [isRemoval] - Whether node is being removd from DOM
     */
    static destroy(elem, isRemoval) {
        return SmoothScrollbar.has(elem) && SmoothScrollbar.get(elem).destroy(isRemoval);
    };

    /**
     * Destroy all scrollbars in scrollbar instances
     * @static
     * @param {boolean} [isRemoval] - Whether node is being removed from DOM
     */
    static destroyAll(isRemoval) {
        ScbList.forEach(scb => {
            scb.destroy(isRemoval);
        });
    };

    // eslint-disable-next-line spaced-comment
    /******************* APIs *******************/
    clearMovement() {
        return this::clearMovement();
    }

    stop() {
        return this::stop();
    }

    destroy(isRemoval) {
        return this::destroy(isRemoval);
    }

    getContentElem() {
        return this::getContentElem();
    }

    getSize() {
        return this::getSize();
    }

    infiniteScroll(cb, threshold) {
        return this::infiniteScroll(cb, threshold);
    }

    isVisible(elem) {
        return this::isVisible(elem);
    }

    addListener(cb) {
        return this::addListener(cb);
    }

    removeListener(cb) {
        return this::removeListener(cb);
    }

    registerEvents(...rules) {
        return this::registerEvents(...rules);
    }

    unregisterEvents(...rules) {
        return this::unregisterEvents(...rules);
    }

    scrollIntoView(elem, options) {
        return this::scrollIntoView(elem, options);
    }

    scrollTo(x, y, duration, cb) {
        return this::scrollTo(x, y, duration, cb);
    }

    setOptions(opts) {
        return this::setOptions(opts);
    }

    setPosition(x, y, withoutCallbacks) {
        return this::setPosition(x, y, withoutCallbacks);
    }

    showTrack(direction) {
        return this::showTrack(direction);
    }

    hideTrack(direction) {
        return this::hideTrack(direction);
    }

    update(inAsync) {
        return this::update(inAsync);
    }
}
