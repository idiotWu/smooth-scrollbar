'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _METHODS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                           * @module
                                                                                                                                                                                                                           * @prototype {Function} showTrack
                                                                                                                                                                                                                           * @prototype {Function} hideTrack
                                                                                                                                                                                                                           */

var ACTIONS = {
    SHOW: 0,
    HIDE: 1
};

var CLASS_NAMES = {
    TRACK: 'show',
    CONTAINER: 'scrolling'
};

var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.SHOW, 'add'), _defineProperty(_METHODS, ACTIONS.HIDE, 'remove'), _METHODS);

function toggleTrack() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ACTIONS.SHOW;

    var method = METHODS[action];

    /**
     * toggle scrollbar track on given direction
     *
     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
     */
    return function () {
        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'both';
        var options = this.options,
            movement = this.movement,
            _targets = this.targets,
            container = _targets.container,
            xAxis = _targets.xAxis,
            yAxis = _targets.yAxis;

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

_smoothScrollbar.SmoothScrollbar.prototype.showTrack = toggleTrack(ACTIONS.SHOW);
_smoothScrollbar.SmoothScrollbar.prototype.hideTrack = toggleTrack(ACTIONS.HIDE);