'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _smoothScrollbar = require('../smooth-scrollbar');

var _shared = require('../shared/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @prototype {Function} __updateTree
 */

function __updateTree() {
    var _targets = this.targets;
    var container = _targets.container;
    var content = _targets.content;


    this.__readonly('children', [].concat((0, _toConsumableArray3.default)(content.querySelectorAll(_shared.selectors))));
    this.__readonly('isNestedScrollbar', false);

    var parents = [];

    var elem = container;

    // eslint-disable-next-line no-cond-assign
    while (elem = elem.parentElement) {
        if (_shared.sbList.has(container)) {
            this.__readonly('isNestedScrollbar', true);
            parents.push(container);
        }
    }

    this.__readonly('parents', parents);
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__updateTree', {
    value: __updateTree,
    writable: true,
    configurable: true
});