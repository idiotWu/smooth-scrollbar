/**
 * @module
 * @prototype {Function} __selectHandler
 */

import { SmoothScrollbar } from '../smooth-scrollbar';
import { setStyle } from '../utils/';

// todo: select handler for touch screen
function __selectHandler() {
    let isSelected = false;
    let animation;

    const {
        container,
        content,
     } = this.targets;

    const scroll = ({ x, y }) => {
        if (!x && !y) return;

        const { speed } = this.options;

        this.__setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(() => {
            scroll({ x, y });
        });
    };

    const setSelect = (value = '') => {
        setStyle(container, {
            '-user-select': value,
        });
    };

    this.__addEvent(window, 'mousemove', (evt) => {
        if (!isSelected) return;

        cancelAnimationFrame(animation);

        const dir = this.__getPointerTrend(evt);

        scroll(dir);
    });

    this.__addEvent(content, 'selectstart', (evt) => {
        if (this.__eventFromChildScrollbar(evt)) {
            return setSelect('none');
        }

        cancelAnimationFrame(animation);

        this.__updateBounding();
        isSelected = true;
    });

    this.__addEvent(window, 'mouseup blur', () => {
        cancelAnimationFrame(animation);
        setSelect();

        isSelected = false;
    });

    // temp patch for touch devices
    this.__addEvent(container, 'scroll', (evt) => {
        evt.preventDefault();
        container.scrollTop = container.scrollLeft = 0;
    });
};

Object.defineProperty(SmoothScrollbar.prototype, '__selectHandler', {
    value: __selectHandler,
    writable: true,
    configurable: true,
});
