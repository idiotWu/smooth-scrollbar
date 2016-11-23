import { toArray } from './to-array';

/**
 * Find element with specific class name within children, like selector '>'
 * @param {element} parentElem
 * @param {string} className
 * @return {element|null} - first matched child
 */
export function findChild(parentElem, className) {
    const children = parentElem.children;

    let res = null;

    if (children) {
        toArray(children).some(elem => {
            if (elem.className.match(className)) {
                res = elem;
                return true;
            }
        });
    }

    return res;
};
