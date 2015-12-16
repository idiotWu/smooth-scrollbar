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
    const { container, content } = this.targets;

    let isDrag = false;
    let animation = undefined;
    let targetHeight = undefined;

    Object.defineProperty(this, '__isDrag', {
        get() {
            return isDrag;
        },
        enumerable: false
    });

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

    this.addEvent(document, 'drag dragover mousemove touchmove', (evt) => {
        if (!isDrag || this.__fromChild(evt)) return;
        clearTimeout(animation);

        const dir = this.__getOverflowDir(evt, targetHeight);

        scroll(dir);
    });

    this.addEvent(container, 'dragstart', (evt) => {
        if (this.__fromChild(evt)) return;

        setStyle(content, {
            'pointer-events': 'auto'
        });

        targetHeight = evt.target.clientHeight;
        clearTimeout(animation);
        this.__updateBounding();
        isDrag = true;
    });
    this.addEvent(document, 'dragend mouseup touchend blur', (evt) => {
        if (this.__fromChild(evt)) return;
        evt.preventDefault();
        clearTimeout(animation);
        isDrag = false;
    });
 };

 Object.defineProperty(SmoothScrollbar.prototype, '__dragHandler', {
     value: __dragHandler,
     writable: true,
     configurable: true
 });
