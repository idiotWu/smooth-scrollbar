'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.updateTree = updateTree;

var _contants = require('../../contants/');

var _utils = require('../utils/');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

/**
 * Update scrollbars tree
 * @private
 */
function updateTree() {
    var _ref = _utils.getPrivateProp.call(this, 'targets');

    var container = _ref.container;
    var content = _ref.content;


    var parents = [];

    var isNested = false;
    var elem = container;

    // eslint-disable-next-line no-cond-assign
    while (elem = elem.parentElement) {
        if (_contants.ScbList.has(elem)) {
            isNested = true;
            parents.push(elem);
        }
    }

    _utils.setPrivateProp.call(this, {
        parents: parents,
        isNestedScrollbar: isNested,
        children: [].concat(_toConsumableArray(content.querySelectorAll(_contants.SELECTOR)))
    });
};