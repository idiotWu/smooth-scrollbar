'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hideTrack = exports.showTrack = undefined;

var _METHODS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ACTIONS = {
    SHOW: 0,
    HIDE: 1
};

var CLASS_NAMES = {
    TRACK: 'show',
    CONTAINER: 'scrolling'
};

var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.SHOW, 'add'), _defineProperty(_METHODS, ACTIONS.HIDE, 'remove'), _METHODS);

var showTrack = exports.showTrack = toggleTrack(ACTIONS.SHOW);
var hideTrack = exports.hideTrack = toggleTrack(ACTIONS.HIDE);

function toggleTrack() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ACTIONS.SHOW;

    var method = METHODS[action];

    /**
     * Toggle scrollbar track on given direction
     *
     * @param {string} direction - which direction of tracks to show/hide, default is 'both'
     */
    return function manager() {
        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'both';

        var _ref = _utils.getPrivateProp.call(this),
            options = _ref.options,
            movement = _ref.movement,
            targets = _ref.targets;

        var container = targets.container,
            xAxis = targets.xAxis,
            yAxis = targets.yAxis;

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