const VENDOR_PREFIX = [
  'webkit',
  'moz',
  'ms',
  'o',
];

const RE = new RegExp(`^-(?!(?:${VENDOR_PREFIX.join('|')})-)`);

function autoPrefix(styles: any) {
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
}

export function setStyle(elem: HTMLElement, styles: any) {
  styles = autoPrefix(styles);

  Object.keys(styles).forEach((prop) => {
    const cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, (_, $1) => $1.toUpperCase());
    elem.style[cssProp] = styles[prop];
  });
}
