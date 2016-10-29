// all scrollbars list
import {
    updateTree,
} from '../modules/core/update-tree';

const ScbList = new Map();

const originSet = ::ScbList.set;
const originDelete = ::ScbList.delete;

ScbList.update = () => {
    ScbList.forEach(scb => {
        scb::updateTree();
    });
};

// patch #set,#delete with #update method
ScbList.delete = (...args) => {
    const res = originDelete(...args);
    ScbList.update();

    return res;
};

ScbList.set = (...args) => {
    const res = originSet(...args);
    ScbList.update();

    return res;
};

export { ScbList };
