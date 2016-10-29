import {
    getPrivateProp,
} from '../utils/';

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

export const showTrack = toggleTrack(ACTIONS.SHOW);
export const hideTrack = toggleTrack(ACTIONS.HIDE);

function toggleTrack(action = ACTIONS.SHOW) {
    const method = METHODS[action];

    /**
     * Toggle scrollbar track on given direction
     *
     * @param {string} direction - which direction of tracks to show/hide, default is 'both'
     */
    return function manager(direction = 'both') {
        const {
            options,
            movement,
            targets,
        } = this::getPrivateProp();

        const {
            container,
            xAxis,
            yAxis,
        } = targets;

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
