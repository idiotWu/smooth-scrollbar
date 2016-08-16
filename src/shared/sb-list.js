/**
 * @module
 * @export {Map} sbList
 */

const sbList = new Map();

const originSet = ::sbList.set;
const originDelete = ::sbList.delete;

sbList.update = () => {
    sbList.forEach((sb) => {
        sb.__updateTree();
    });
};

// patch #set,#delete with #update method
sbList.delete = (...args) => {
    const res = originDelete(...args);
    sbList.update();

    return res;
};

sbList.set = (...args) => {
    const res = originSet(...args);
    sbList.update();

    return res;
};

export { sbList };
