/**
 * @module
 * @prototype {Function} showTrack
 * @prototype {Function} hideTrack
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

function toggleTrack(action = 'show') {
    const method = action === 'show' ? 'add' : 'remove';

    /**
     * toggle scrollbar track on given direction
     *
     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
     */
    return function(direction = 'both') {
        const { container, xAxis, yAxis } = this.targets;

        direction = direction.toLowerCase();
        container.classList[method]('scrolling');

        if (direction === 'both') {
            xAxis.track.classList[method]('show');
            yAxis.track.classList[method]('show');
        }

        if (direction === 'x') {
            xAxis.track.classList[method]('show');
        }

        if (direction === 'y') {
            yAxis.track.classList[method]('show');
        }
    };
};

SmoothScrollbar.prototype.showTrack = toggleTrack('show');
SmoothScrollbar.prototype.hideTrack = toggleTrack('hide');