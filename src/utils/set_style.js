/**
 * @module
 * @export {Function} setStyle
 */

const VENDOR_PREFIX = [
    'webkit',
    'moz',
    'ms',
    'o',
];

const RE = new RegExp(`^-(?!(?:${VENDOR_PREFIX.join('|')})-)`);

const autoPrefix = (styles) => {
    const res = {};

    Object.keys(styles).forEach((prop) => {
        if (!RE.test(prop)) {
            res[prop] = styles[prop];
            return;
        }

        const val = styles[prop];

        prop = prop.replace(/^-/, '');
        res[prop] = val;

        VENDOR_PREFIX.forEach((prefix) => {
            res[`-${prefix}-${prop}`] = val;
        });
    });

    return res;
};

/**
 * set css style for target element
 *
 * @param {Element} elem: target element
 * @param {Object} styles: css styles to apply
 */
export const setStyle = (elem, styles) => {
    styles = autoPrefix(styles);

    Object.keys(styles).forEach((prop) => {
        const cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, (m, $1) => $1.toUpperCase());
        elem.style[cssProp] = styles[prop];
    });
};
