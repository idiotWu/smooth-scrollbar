/**
 * @module
 * @prototype {Function} __dragHandler
 */

 import '../apis/';
 import '../internals/';
 import { SmoothScrollbar } from '../smooth_scrollbar';
 import { getOriginalEvent, getPosition, getTouchID, pickInRange, setStyle } from '../utils/index';

 export { SmoothScrollbar };

 let __dragHandler = function({ speed, stepLength }) {
    const { container } = this.targets;

    let isDrag = false;
    let animation = undefined;

    Object.defineProperty(this, '__isDrag', {
        get() {
            return isDrag;
        },
        enumerable: false
    });

    let scroll = ({ x, y }) => {
        const { offset } = this;
        this.scrollTo(offset.x + x * speed * stepLength, offset.y + y * speed * stepLength, 100);
    };

    this.addEvent(container, 'drag', (evt) => {
        if (this.__fromChild(evt)) return;

        clearInterval(animation);

        const dir = this.__getOverflowDir(evt);

        if (!dir.x && !dir.y) return;

        scroll(dir);
        animation = setInterval(() => {
            scroll(dir);
        }, 100);
    });

    this.addEvent(container, 'dragstart', (evt) => {
        if (this.__fromChild(evt)) return;

        clearInterval(animation);
        this.__updateBounding();
        isDrag = true;
    });
    this.addEvent(container, 'dragend', (evt) => {
        if (this.__fromChild(evt)) return;
        clearInterval(animation);
        isDrag = false;
    });
 };

 Object.defineProperty(SmoothScrollbar.prototype, '__dragHandler', {
     value: __dragHandler,
     writable: true,
     configurable: true
 });
