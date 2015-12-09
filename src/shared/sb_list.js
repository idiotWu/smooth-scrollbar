/**
 * @module
 * @export {Map} sbList
 */

const sbList = new Map();

const originSet = ::sbList.set;

sbList.update = () => {
    sbList.forEach((sb) => {
        requestAnimationFrame(() => {
            sb.__updateChildren();
        });
    });
};

// patch #set with #update method
sbList.set = (...args) => {
    const res = originSet(...args);
    sbList.update();

    return res;
};

export { sbList };