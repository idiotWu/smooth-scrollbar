import {
    setStyle,
} from '../../helpers/';

import {
    getPrivateProp,
    setPrivateProp,
} from '../utils/';

import {
    addEvent,
    updateBounding,
    getPointerOffset,
} from '../dom/';

import {
    isFromNested,
} from '../core/';

import {
    setMovement,
} from '../render/';

/**
 * Drag events handler
 * @private
 */
export function handleDragEvents() {
    const {
        container,
        content,
    } = this::getPrivateProp('targets');

    let isDraging = false;
    let animation, padding;

    this::setPrivateProp({
        get isDraging() {
            return isDraging;
        },
    });

    const scroll = ({ x, y }) => {
        if (!x && !y) return;

        const { speed } = this::getPrivateProp('options');

        this::setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(() => {
            scroll({ x, y });
        });
    };

    this::addEvent(container, 'dragstart', (evt) => {
        if (this::isFromNested(evt)) return;

        isDraging = true;
        padding = evt.target.clientHeight;

        setStyle(content, {
            'pointer-events': 'auto',
        });

        cancelAnimationFrame(animation);
        this::updateBounding();
    });

    this::addEvent(document, 'dragover mousemove touchmove', (evt) => {
        if (!isDraging || this::isFromNested(evt)) return;
        cancelAnimationFrame(animation);
        evt.preventDefault();

        const dir = this::getPointerOffset(evt, padding);

        scroll(dir);
    });

    this::addEvent(document, 'dragend mouseup touchend blur', () => {
        cancelAnimationFrame(animation);
        isDraging = false;
    });
};
