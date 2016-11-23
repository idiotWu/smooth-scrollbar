/**
 * Find element with specific class name within children, like selector '>'
 * @param {element} parentElem
 * @param {string} className
 * @return {element|null} - first matched child
 */
export function findChild(parentElem, className) {
    const children = parentElem.children;

    if (!children) return;

    for (let i = 0, max = children.length; i < max; i++) {
        const elem = children[i];

        if (elem.className.match(className)) {
            return elem;
        }
    }
};
