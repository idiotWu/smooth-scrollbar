"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @module
 * @export {Map} sbList
 */

var sbList = new Map();

var originSet = sbList.set.bind(sbList);
var originDelete = sbList.delete.bind(sbList);

sbList.update = function () {
    sbList.forEach(function (sb) {
        requestAnimationFrame(function () {
            sb.__updateTree();
        });
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