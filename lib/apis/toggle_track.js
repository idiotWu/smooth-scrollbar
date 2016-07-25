'use strict';

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _METHODS; /**
               * @module
               * @prototype {Function} showTrack
               * @prototype {Function} hideTrack
               */

var _smooth_scrollbar = require('../smooth_scrollbar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACTIONS = {
    SHOW: 0,
    HIDE: 1
};

var CLASS_NAMES = {
    TRACK: 'show',
    CONTAINER: 'scrolling'
};

var METHODS = (_METHODS = {}, (0, _defineProperty3.default)(_METHODS, ACTIONS.SHOW, 'add'), (0, _defineProperty3.default)(_METHODS, ACTIONS.HIDE, 'remove'), _METHODS);

function toggleTrack() {
    var action = arguments.length <= 0 || arguments[0] === undefined ? ACTIONS.SHOW : arguments[0];

    var method = METHODS[action];

    /**
     * toggle scrollbar track on given direction
     *
     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
     */
    return function () {
        var direction = arguments.length <= 0 || arguments[0] === undefined ? 'both' : arguments[0];
        var options = this.options;
        var movement = this.movement;
        var _targets = this.targets;
        var container = _targets.container;
        var xAxis = _targets.xAxis;
        var yAxis = _targets.yAxis;

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

_smooth_scrollbar.SmoothScrollbar.prototype.showTrack = toggleTrack(ACTIONS.SHOW);
_smooth_scrollbar.SmoothScrollbar.prototype.hideTrack = toggleTrack(ACTIONS.HIDE);