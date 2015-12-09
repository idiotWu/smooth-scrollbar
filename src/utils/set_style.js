/**
 * @module
 * @export {Function} setStyle
 */

/**
 * set css style for target element
 *
 * @param {Element} elem: target element
 * @param {Object} styles: css styles to apply
 */
export let setStyle = (elem, styles) => {
    Object.keys(styles).forEach((prop) => {
        let cssProp = prop.replace(/^-/, '')
                          .replace(/-([a-z])/g, (m, $1) => $1.toUpperCase());
        elem.style[cssProp] = styles[prop];
    });
};