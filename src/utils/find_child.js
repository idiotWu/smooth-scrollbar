/**
 * @module
 * @export {Function} findChild
 */

/**
 * Find element with specific class name within children
 *
 * @param {Element} parentElem
 * @param {String} className
 *
 * @return {Element}: first matched child
 */
export let findChild = (parentElem, className) => {
    let children = parentElem.children;

    if (!children) return null;

    for (let elem of children) {
        if (elem.className.match(className)) return elem;
    }

    return null;
};