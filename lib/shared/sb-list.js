"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @export {Map} sbList
 */

var sbList = new _map2.default();

var originSet = sbList.set.bind(sbList);
var originDelete = sbList.delete.bind(sbList);

sbList.update = function () {
    sbList.forEach(function (sb) {
        sb.__updateTree();
    });
};

// patch #set,#delete with #update method
sbList.delete = function () {
    var res = originDelete.apply(undefined, arguments);
    sbList.update();

    return res;
};

sbList.set = function () {
    var res = originSet.apply(undefined, arguments);
    sbList.update();

    return res;
};

exports.sbList = sbList;