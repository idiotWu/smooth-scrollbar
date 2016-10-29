'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unregisterEvents = exports.registerEvents = undefined;

var _METHODS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _utils = require('../utils/');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ACTIONS = {
    REGIESTER: 0,
    UNREGIESTER: 1
};

var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.REGIESTER, 'addEventListener'), _defineProperty(_METHODS, ACTIONS.UNREGIESTER, 'removeEventListener'), _METHODS);

var registerEvents = exports.registerEvents = manageEvents(ACTIONS.REGIESTER);
var unregisterEvents = exports.unregisterEvents = manageEvents(ACTIONS.UNREGIESTER);

function matchSomeRules(str, rules) {
    return !!rules.length && rules.some(function (regex) {
        return str.match(regex);
    });
};

function manageEvents() {
    var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ACTIONS.REGIESTER;

    var method = METHODS[action];

    /**
     * (un)Register DOM events
     * @param  {...string|regex} rules - A list of pattern of event names
     */
    return function manager() {
        for (var _len = arguments.length, rules = Array(_len), _key = 0; _key < _len; _key++) {
            rules[_key] = arguments[_key];
        }

        _utils.getPrivateProp.call(this, 'eventHandlers').forEach(function (handler) {
            var elem = handler.elem,
                evt = handler.evt,
                fn = handler.fn,
                hasRegistered = handler.hasRegistered;


            if (hasRegistered && action === ACTIONS.REGIESTER || !hasRegistered && action === ACTIONS.UNREGIESTER) {
                return;
            }

            if (matchSomeRules(evt, rules)) {
                elem[method](evt, fn);
                handler.hasRegistered = !hasRegistered;
            }
        });
    };
};