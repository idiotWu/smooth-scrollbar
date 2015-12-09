/**
 * @module
 * @prototype {Function} showTrack
 * @prototype {Function} hideTrack
 *
 * @dependencies [ SmoothScrollbar ]
 */

import { SmoothScrollbar } from '../smooth_scrollbar';

export { SmoothScrollbar };

/**
 * @method
 * @api
 * Get scroll content element
 */
SmoothScrollbar.prototype.showTrack = function(direction = 'both') {
    const { container, xAxis, yAxis } = this.targets;

    direction = direction.toLowerCase();
    container.classList.add('scrolling');

    if (direction === 'both') {
        xAxis.track.classList.add('show');
        yAxis.track.classList.add('show');
    }

    if (direction === 'x') {
        xAxis.track.classList.add('show');
    }

    if (direction === 'y') {
        yAxis.track.classList.add('show');
    }
};

SmoothScrollbar.prototype.hideTrack = function() {
    const { targets, __timerID } = this;
    const { container, xAxis, yAxis } = targets;

    clearTimeout(__timerID.track);

    __timerID.track = setTimeout(() => {
        container.classList.remove('scrolling');
        xAxis.track.classList.remove('show');
        yAxis.track.classList.remove('show');
    }, 300);
};