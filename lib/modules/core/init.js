'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.init = init;

var _events = require('../events/');

var EventHandlers = _interopRequireWildcard(_events);

var _apis = require('../apis/');

var _render = require('../render/');

var _initPrivates = require('./init-privates');

var _initOptions = require('./init-options');

var _initTargets = require('./init-targets');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Initialize scrollbar
 * @private
 * @param {element} container - Scrollbar container
 * @param {object} [options] - Init options
 */
function init(container) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    // init vars
    _initPrivates.initPrivates.call(this);
    _initTargets.initTargets.call(this, container);
    _initOptions.initOptions.call(this, options);

    // init thumb position
    _apis.update.call(this);

    // init events
    (0, _keys2.default)(EventHandlers).forEach(function (key) {
        // eslint-disable-next-line import/namespace
        var fn = EventHandlers[key];
        fn.call(_this);
    });

    _render.render.call(this);
};