'use strict';

var _defineProperty2 = require('babel-runtime/core-js/object/define-property');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _METHODS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

function _defineProperty(obj, key, value) { if (key in obj) { (0, _defineProperty3.default)(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                           * @module
                                                                                                                                                                                                                           * @prototype {Function} unregisterEvents
                                                                                                                                                                                                                           */

var ACTIONS = {
    REGIESTER: 0,
    UNREGIESTER: 1
};

var METHODS = (_METHODS = {}, _defineProperty(_METHODS, ACTIONS.REGIESTER, 'addEventListener'), _defineProperty(_METHODS, ACTIONS.UNREGIESTER, 'removeEventListener'), _METHODS);

function matchSomeRules(str, rules) {
    return !!rules.length && rules.some(function (regex) {
        return str.match(regex);
    });
};

function manageEvents() {
    var action = arguments.length <= 0 || arguments[0] === undefined ? ACTIONS.REGIESTER : arguments[0];

    var method = METHODS[action];

    return function () {
        for (var _len = arguments.length, rules = Array(_len), _key = 0; _key < _len; _key++) {
            rules[_key] = arguments[_key];
        }

        this.__handlers.forEach(function (handler) {
            var elem = handler.elem;
            var evt = handler.evt;
            var fn = handler.fn;
            var hasRegistered = handler.hasRegistered;


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

_smoothScrollbar.SmoothScrollbar.prototype.registerEvents = manageEvents(ACTIONS.REGIESTER);
_smoothScrollbar.SmoothScrollbar.prototype.unregisterEvents = manageEvents(ACTIONS.UNREGIESTER);