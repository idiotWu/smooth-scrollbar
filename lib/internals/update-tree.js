'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _smoothScrollbar = require('../smooth-scrollbar');

var _shared = require('../shared/');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } } /**
                                                                                                                                                                                                              * @module
                                                                                                                                                                                                              * @prototype {Function} __updateTree
                                                                                                                                                                                                              */

function __updateTree() {
    var _targets = this.targets,
        container = _targets.container,
        content = _targets.content;


    this.__readonly('children', [].concat(_toConsumableArray(content.querySelectorAll(_shared.selectors))));
    this.__readonly('isNestedScrollbar', false);

    var parents = [];

    var elem = container;

    // eslint-disable-next-line no-cond-assign
    while (elem = elem.parentElement) {
        if (_shared.sbList.has(elem)) {
            this.__readonly('isNestedScrollbar', true);
            parents.push(elem);
        }
    }

    this.__readonly('parents', parents);
};

Object.defineProperty(_smoothScrollbar.SmoothScrollbar.prototype, '__updateTree', {
    value: __updateTree,
    writable: true,
    configurable: true
});