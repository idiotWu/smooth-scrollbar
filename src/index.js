import { SmoothScrollbar } from './smooth_scrollbar';
import { selectors, sbList } from './shared';

import './apis/';
import './render/';
import './events/';
import './internals/';

export default SmoothScrollbar;

SmoothScrollbar.version = '<%= version %>';

/**
 * init scrollbar on given element
 *
 * @param {Element} elem: target element
 * @param {Object} options: scrollbar options
 *
 * @return {Scrollbar} scrollbar instance
 */
SmoothScrollbar.init = (elem, options) => {
    if (!elem || elem.nodeType !== 1) {
        throw new TypeError(`expect element to be DOM Element, but got ${typeof elem}`);
    }

    if (sbList.has(elem)) return sbList.get(elem);

    elem.setAttribute('data-scrollbar', '');

    const children = [...elem.children];

    const div = document.createElement('div');

    div.innerHTML = `
        <article class="scroll-content"></article>
        <aside class="scrollbar-track scrollbar-track-x">
            <div class="scrollbar-thumb scrollbar-thumb-x"></div>
        </aside>
        <aside class="scrollbar-track scrollbar-track-y">
            <div class="scrollbar-thumb scrollbar-thumb-y"></div>
        </aside>
    `;

    const scrollContent = div.querySelector('.scroll-content');

    [...div.children].forEach((el) => elem.appendChild(el));

    children.forEach((el) => scrollContent.appendChild(el));

    return new SmoothScrollbar(elem, options);
};

/**
 * init scrollbars on pre-defined selectors
 *
 * @param {Object} options: scrollbar options
 *
 * @return {Array} a collection of scrollbar instances
 */
SmoothScrollbar.initAll = (options) => {
    return [...document.querySelectorAll(selectors)].map((el) => {
        return SmoothScrollbar.init(el, options);
    });
};

/**
 * check if scrollbar exists on given element
 *
 * @return {Boolean}
 */
SmoothScrollbar.has = (elem) => {
    return sbList.has(elem);
};

/**
 * get scrollbar instance through given element
 *
 * @param {Element} elem: target scrollbar container
 *
 * @return {Scrollbar}
 */
SmoothScrollbar.get = (elem) => {
    return sbList.get(elem);
};

/**
 * get all scrollbar instances
 *
 * @return {Array} a collection of scrollbars
 */
SmoothScrollbar.getAll = () => {
    return [...sbList.values()];
};

/**
 * destroy scrollbar on given element
 *
 * @param {Element} elem: target scrollbar container
 */
SmoothScrollbar.destroy = (elem) => {
    return SmoothScrollbar.has(elem) && SmoothScrollbar.get(elem).destroy();
};

/**
 * destroy all scrollbars in scrollbar instances
 */
SmoothScrollbar.destroyAll = () => {
    sbList.forEach((sb) => {
        sb.destroy();
    });
};