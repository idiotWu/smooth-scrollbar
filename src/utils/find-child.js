/**
 * @module
 * @export {Function} findChild
 */

/**
 * Find element with specific class name within children, like selector '>'
 *
 * @param {Element} parentElem
 * @param {String} className
 *
 * @return {Element}: first matched child
 */
export const findChild = (parentElem, className) => {
    const children = parentElem.children;

    let res = null;

    if (children) {
        [...children].some(elem => {
            if (elem.className.match(className)) {
                res = elem;
                return true;
            }
        });
    }

    return res;
};
