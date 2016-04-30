/**
 * @module
 * @prototype {Function} __dragHandler
 */

 import { SmoothScrollbar } from '../smooth_scrollbar';
 import { setStyle } from '../utils/';

 export { SmoothScrollbar };

 let __dragHandler = function() {
    const { container, content } = this.targets;

    let isDrag = false;
    let animation = undefined;
    let padding = undefined;

    Object.defineProperty(this, '__isDrag', {
        get() {
            return isDrag;
        },
        enumerable: false
    });

    let scroll = ({ x, y }) => {
        if (!x && !y) return;

        let { speed } = this.options;

        this.__setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(() => {
            scroll({ x, y });
        });
    };

    this.__addEvent(container, 'dragstart', (evt) => {
        if (this.__eventFromChildScrollbar(evt)) return;

        isDrag = true;
        padding = evt.target.clientHeight;

        setStyle(content, {
            'pointer-events': 'auto'
        });

        cancelAnimationFrame(animation);
        this.__updateBounding();
    });

    this.__addEvent(document, 'dragover mousemove touchmove', (evt) => {
        if (!isDrag || this.__eventFromChildScrollbar(evt)) return;
        cancelAnimationFrame(animation);
        evt.preventDefault();

        const dir = this.__getPointerTrend(evt, padding);

        scroll(dir);
    });

    this.__addEvent(document, 'dragend mouseup touchend blur', (evt) => {
        if (this.__eventFromChildScrollbar(evt)) return;
        cancelAnimationFrame(animation);
        isDrag = false;
    });
 };

 Object.defineProperty(SmoothScrollbar.prototype, '__dragHandler', {
     value: __dragHandler,
     writable: true,
     configurable: true
 });
