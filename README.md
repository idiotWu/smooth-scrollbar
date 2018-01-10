# Smooth Scrollbar

Customizable, Flexible, and High Performance Scrollbars!

[![npm][npm-version-badge]](https://www.npmjs.com/package/smooth-scrollbar)
[![downloads][npm-downloads-badge]](https://www.npmjs.com/package/smooth-scrollbar)
[![core size][size-badge]](dist/smooth-scrollbar.js)
[![gzip size][gzip-size-badge]](dist/smooth-scrollbar.js)
[![Build status][travis-badge]](https://travis-ci.org/idiotWu/smooth-scrollbar)
[![license][license-badge]](LICENSE)

## Installation

> ⚠️ DO NOT use custom scrollbars unless you know what you are doing. [Read more](docs/caveats.md)

Via NPM **(recommended)**:

```
npm install smooth-scrollbar --save
```

Via Bower:

```
bower install smooth-scrollbar --save
```

## Browser Compatibility

| Browser | Version |
| :------ | :-----: |
| IE      | 10+     |
| Chrome  | 22+     |
| Firefox | 16+     |
| Safari  | 8+      |
| Android Browser | 4+ |
| Chrome for Android | 32+ |
| iOS Safari | 7+ |

## Demo

https://idiotwu.github.io/smooth-scrollbar/

## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it's highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):

```js
import Scrollbar from 'smooth-scrollbar';

Scrollbar.init(document.querySelector('#my-scrollbar'));
```

If you are not using any bundlers, you can just load the UMD bundle:

```html
<script src="dist/smooth-scrollbar.js"></script>

<script>
  var Scrollbar = window.Scrollbar;

  Scrollbar.init(document.querySelector('#my-scrollbar'));
</script>
```

## Documentation

| [latest](docs) | [7.x](https://github.com/idiotWu/smooth-scrollbar/tree/7.x) |
|----|----|

## Who's Using It

- [conference.awwwards.com](https://conference.awwwards.com/): Awwwards Conference - An Event for UX / UI Designers and Web Developers.
- [lp.anzi.kr](http://lp.anzi.kr/): Listeners Playlist.
- Feel free to add yours here 🤗.

## License

[MIT](LICENSE)

[npm-version-badge]: https://img.shields.io/npm/v/smooth-scrollbar.svg?style=flat-square
[npm-downloads-badge]: https://img.shields.io/npm/dt/smooth-scrollbar.svg?style=flat-square
[license-badge]: https://img.shields.io/npm/l/smooth-scrollbar.svg?style=flat-square
[travis-badge]: https://img.shields.io/travis/idiotWu/smooth-scrollbar.svg?style=flat-square
[size-badge]: http://img.badgesize.io/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.js?label=core%20size&style=flat-square
[gzip-size-badge]: http://img.badgesize.io/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.js?label=gzip%20size&compression=gzip&style=flat-square
