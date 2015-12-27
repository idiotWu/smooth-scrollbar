/**
 * @module
 * @prototype {Function} __selectHandler
 */

 import '../apis/';
 import '../internals/';
 import { SmoothScrollbar } from '../smooth_scrollbar';
 import { getOriginalEvent, getPosition, getTouchID, pickInRange, setStyle } from '../utils/index';

 export { SmoothScrollbar };

// todo: select handler for touch screen
 let __selectHandler = function({ speed, stepLength }) {
    let isSelected = false;
    let animation = undefined;

    const { container } = this.targets;


    let scroll = ({ x, y }) => {
        if (!x && !y) return;

        const { offset } = this;
        const duration = Math.sqrt(Math.abs(x) + Math.abs(y)) * 60;

        this.scrollTo(
            offset.x + x * speed * stepLength,
            offset.y + y * speed * stepLength,
            duration
        );

        animation = setTimeout(() => {
            scroll({ x, y });
        }, duration);
    };

    let setSelect = (value = 'auto') => {
        setStyle(container, {
            '-webkit-user-select': value,
               '-moz-user-select': value,
                '-ms-user-select': value,
                    'user-select': value
        });
    };

    this.addEvent(window, 'mousemove', (evt) => {
        if (!isSelected) return;

        if (this.__fromChild(evt)) {
            return setSelect('none');
        }

        clearTimeout(animation);
        setSelect('auto');

        const dir = this.__getOverflowDir(evt);

        scroll(dir);
    });

    this.addEvent(container, 'selectstart', (evt) => {
        evt.stopPropagation();
        clearTimeout(animation);
        this.__updateBounding();
        isSelected = true;
    });

    this.addEvent(window, 'mouseup blur', () => {
        if (!isSelected) return;

        clearTimeout(animation);
        setSelect('auto');

        isSelected = false;
    });

    // temp patch for touch devices
    this.addEvent(container, 'scroll', (evt) => {
        evt.preventDefault();
        container.scrollTop = container.scrollLeft = 0;
    });
 };

 Object.defineProperty(SmoothScrollbar.prototype, '__selectHandler', {
     value: __selectHandler,
     writable: true,
     configurable: true
 });
