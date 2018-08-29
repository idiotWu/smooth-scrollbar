# Smooth Scrollbar

[![npm][npm-version-badge]](https://www.npmjs.com/package/smooth-scrollbar)
[![monthly downloads][npm-downloads-badge]](https://www.npmjs.com/package/smooth-scrollbar)
[![core size][size-badge]](dist/smooth-scrollbar.js)
[![gzip size][gzip-size-badge]](dist/smooth-scrollbar.js)
[![Build status][travis-badge]](https://travis-ci.org/idiotWu/smooth-scrollbar)

Customizable, Flexible, and High Performance Scrollbars!

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
- [Matter](https://matterapp.com/): A new and better way to grow your professional skills.
- Feel free to add yours here 🤗.

## License

[MIT](LICENSE)

[npm-version-badge]: https://img.shields.io/npm/v/smooth-scrollbar.svg?style=for-the-badge
[npm-downloads-badge]: https://img.shields.io/npm/dm/smooth-scrollbar.svg?style=for-the-badge
[travis-badge]: https://img.shields.io/travis/idiotWu/smooth-scrollbar.svg?style=for-the-badge
[size-badge]: http://img.badgesize.io/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.js?label=core%20size&style=for-the-badge
[gzip-size-badge]: http://img.badgesize.io/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.js?label=gzip%20size&compression=gzip&style=for-the-badge
