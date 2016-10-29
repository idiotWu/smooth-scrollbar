import {
    handleKeyboardEvents,
    handleResizeEvents,
    handleSelectEvents,
    handleMouseEvents,
    handleTouchEvents,
    handleWheelEvents,
    handleDragEvents,
} from '../events/';

import {
    update,
} from '../apis/';

import {
    render,
} from '../render/';

import { initPrivates } from './init-privates';
import { initOptions } from './init-options';
import { initTargets } from './init-targets';

/**
 * Initialize scrollbar
 * @private
 * @param {element} container - Scrollbar container
 * @param {object} [options] - Init options
 */
export function initScrollbar(container, options = {}) {
    // init vars
    this::initPrivates();
    this::initTargets(container);
    this::initOptions(options);

    this::update(); // initialize thumb position

    this::handleKeyboardEvents();
    this::handleResizeEvents();
    this::handleSelectEvents();
    this::handleMouseEvents();
    this::handleTouchEvents();
    this::handleWheelEvents();
    this::handleDragEvents();

    this::render();
};
