/**
 * @module
 * @prototype {Function} showTrack
 * @prototype {Function} hideTrack
 */

import { SmoothScrollbar } from '../smooth-scrollbar';

const ACTIONS = {
    SHOW: 0,
    HIDE: 1,
};

const CLASS_NAMES = {
    TRACK: 'show',
    CONTAINER: 'scrolling',
};

const METHODS = {
    [ACTIONS.SHOW]: 'add',
    [ACTIONS.HIDE]: 'remove',
};

function toggleTrack(action = ACTIONS.SHOW) {
    const method = METHODS[action];

    /**
     * toggle scrollbar track on given direction
     *
     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
     */
    return function (direction = 'both') {
        const {
            options,
            movement,
            targets: { container, xAxis, yAxis },
        } = this;

        // add/remove scrolling class to container
        if (movement.x || movement.y) {
            container.classList.add(CLASS_NAMES.CONTAINER);
        } else {
            container.classList.remove(CLASS_NAMES.CONTAINER);
        }

        // keep showing
        if (options.alwaysShowTracks && action === ACTIONS.HIDE) return;

        direction = direction.toLowerCase();

        if (direction === 'both') {
            xAxis.track.classList[method](CLASS_NAMES.TRACK);
            yAxis.track.classList[method](CLASS_NAMES.TRACK);
        }

        if (direction === 'x') {
            xAxis.track.classList[method](CLASS_NAMES.TRACK);
        }

        if (direction === 'y') {
            yAxis.track.classList[method](CLASS_NAMES.TRACK);
        }
    };
};

SmoothScrollbar.prototype.showTrack = toggleTrack(ACTIONS.SHOW);
SmoothScrollbar.prototype.hideTrack = toggleTrack(ACTIONS.HIDE);
