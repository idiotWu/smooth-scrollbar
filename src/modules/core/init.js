import * as EventHandlers from '../events/';

import {
    update,
} from '../metrics/';

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
export function init(container, options = {}) {
    // init vars
    this::initPrivates();
    this::initTargets(container);
    this::initOptions(options);

    // init thumb position
    this::update();

    // init events
    Object.keys(EventHandlers).forEach(key => {
        // eslint-disable-next-line import/namespace
        const fn = EventHandlers[key];
        this::fn();
    });

    this::render();
};
