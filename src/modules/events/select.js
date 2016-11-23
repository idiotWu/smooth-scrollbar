import {
    setStyle,
} from '../../helpers/';

import {
    getPrivateProp,
} from '../namespace/';

import {
    getPointerOffset,
} from '../metrics/';

import {
    setMovement,
} from '../movement/';

import { addEvent } from '../utils/';

/**
 * Select events handler
 * Todo: select handler for touch screen
 * @private
 */
export function handleSelectEvents() {
    let isSelected = false;
    let animation;

    const {
        container,
        content,
    } = this::getPrivateProp('targets');

    const scroll = ({ x, y }) => {
        if (!x && !y) return;

        const {
            speed,
        } = this::getPrivateProp('options');

        this::setMovement(x * speed, y * speed);

        animation = requestAnimationFrame(() => {
            scroll({ x, y });
        });
    };

    const setSelect = (value = '') => {
        setStyle(container, {
            '-user-select': value,
        });
    };

    this::addEvent(window, 'mousemove', (evt) => {
        if (!isSelected) return;

        cancelAnimationFrame(animation);

        const dir = this::getPointerOffset(evt);

        scroll(dir);
    });

    this::addEvent(content, 'selectstart', (evt) => {
        cancelAnimationFrame(animation);
        isSelected = true;
    });

    this::addEvent(window, 'mouseup blur', () => {
        cancelAnimationFrame(animation);
        setSelect();

        isSelected = false;
    });

    // temp patch for touch devices
    this::addEvent(container, 'scroll', (evt) => {
        evt.preventDefault();
        container.scrollTop = container.scrollLeft = 0;
    });
};
