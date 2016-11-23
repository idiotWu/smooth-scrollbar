import {
    getPrivateProp,
} from '../namespace/';

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

/**
 * Toggle scrollbar track on given direction
 * @public
 * @api
 * @param {string} [direction='both'] - which direction of tracks to show/hide
 */
export const showTrack = toggleTrack(ACTIONS.SHOW, 'showTrack');
export const hideTrack = toggleTrack(ACTIONS.HIDE, 'hideTrack');

function toggleTrack(action = ACTIONS.SHOW, name = 'trackManager') {
    const method = METHODS[action];

    function trackManager(direction = 'both') {
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

    // override function name
    Object.defineProperty(trackManager, 'name', {
        value: name,
        configurable: true,
    });

    return trackManager;
};
