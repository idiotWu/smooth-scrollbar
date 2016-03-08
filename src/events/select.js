/**
 * @module
 * @prototype {Function} __selectHandler
 */

 import { SmoothScrollbar } from '../smooth_scrollbar';
 import {
    getOriginalEvent,
    getPosition,
    getTouchID,
    pickInRange,
    setStyle
} from '../utils/index';

 export { SmoothScrollbar };

// todo: select handler for touch screen
 let __selectHandler = function() {
    let isSelected = false;
    let animation = undefined;

    const { container, content } = this.targets;

    let scroll = ({ x, y }) => {
        if (!x && !y) return;

        this.__setMovement(x, y);

        animation = requestAnimationFrame(() => {
            scroll({ x, y });
        });
    };

    let setSelect = (value = '') => {
        setStyle(container, {
            '-user-select': value
        });
    };

    this.__addEvent(window, 'mousemove', (evt) => {
        if (!isSelected) return;

        cancelAnimationFrame(animation);

        const dir = this.__getPointerTrend(evt);

        scroll(dir);
    });

    this.__addEvent(content, 'selectstart', (evt) => {
        if (this.__ignoreEvent(evt)) {
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
     configurable: true
 });
