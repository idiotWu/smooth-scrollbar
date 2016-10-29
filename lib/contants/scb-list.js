"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// all scrollbars list

var ScbList = new _map2.default();

var originSet = ScbList.set.bind(ScbList);
var originDelete = ScbList.delete.bind(ScbList);

ScbList.update = function () {
    ScbList.forEach(function (scb) {
        scb.__updateTree();
    });
};

// patch #set,#delete with #update method
ScbList.delete = function () {
    var res = originDelete.apply(undefined, arguments);
    ScbList.update();

    return res;
};

ScbList.set = function () {
    var res = originSet.apply(undefined, arguments);
    ScbList.update();

    return res;
};

exports.ScbList = ScbList;