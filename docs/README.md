# Smooth Scrollbar

> This is the API documentation for `smooth-scrollbar@8.x`, check [here](https://github.com/idiotWu/smooth-scrollbar/tree/7.x) for the docs of version 7.x.

> Looking for migration guides? See [migration guide](migration.md) for details.

## What is smooth-scrollbar?

Smooth Scrollbar is a JavaScript Plugin that allows you customizing high perfermance scrollbars cross browsers. It is using `translate3d` to perform a momentum based scrolling (aka inertial scrolling) on modern browsers. With the flexible [plugin system](plugin.md), we can easily redesign the scrollbar as we want. This is the scrollbar plugin that you've ever dreamed of!

## Installation

Via NPM **(recommended)**:

```shell
npm install smooth-scrollbar --save
```

Via Bower:

```shell
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

Scrollbar.init(document.querySelector('#my-scrollbar'), options);
```

If you are not using any bundlers, you can just load the UMD bundle:

```html
<script src="dist/smooth-scrollbar.js"></script>

<script>
  var Scrollbar = window.Scrollbar;

  Scrollbar.init(document.querySelector('#my-scrollbar'), options);
</script>
```

### Common mistakes

#### Initialize a scrollbar without a limited width or height

Likes the native scrollbars, a scrollable area means **the content insides it is larger than the container itself**, for example, a `500*500` area with a content which size is `1000*1000`:

```
              container
                 /
       +--------+
  #####################
  #    |        |     #
  #    |        |     #
  #    +--------+     # -- content
  #                   #
  #                   #
  #####################
```

Therefore, it's necessary to set the `width` or `height` for the container element:

```css
#my-scrollbar {
  width: 500px;
  height: 500px;
  overflow: auto;
}
```

If the container element is natively scrollable before initializing the Scrollbar, it means you are on the correct way.

## Available Options for Scrollbar

| parameter | type | default | description |
| :--------: | :--: | :-----: | :---------- |
| damping | `number` | `0.1` | Momentum reduction damping factor, a float value between `(0, 1)`. The lower the value is, the more smooth the scrolling will be (also the more paint frames). |
| thumbMinSize | `number` | `20` | Minimal size for scrollbar thumbs. |
| renderByPixels | `boolean` | `true` | Render every frame in integer pixel values, set to `true` to improve scrolling performance. |
| alwaysShowTracks | `boolean` | `false` | Keep scrollbar tracks visible. |
| continuousScrolling | `boolean` | `true` | Set to `true` to allow outer scrollbars continue scrolling when current scrollbar reaches edge. |
| delegateTo | `EventTarget` | `null` | Delegate _wheel events_ and _touch events_ to the given element. By default, the container element is used. This option will be useful for dealing with fixed elements.  |
| plugins | `object` | `{}` | Options for plugins, see [Plugin System](plugin.md). |

**Confusing with the option field? Try real-time edit tool on [demo page](http://idiotwu.github.io/smooth-scrollbar/)!**

## DOM Structure

The following is the DOM structure that Scrollbar yields:

```html
<scrollbar>
    <div class="scroll-content">
        your contents here...
    </div>
    <div class="scrollbar-track scrollbar-track-x">
        <div class="scrollbar-thumb scrollbar-thumb-x"></div>
    </div>
    <div class="scrollbar-track scrollbar-track-y">
        <div class="scrollbar-thumb scrollbar-thumb-y"></div>
    </div>
</scrollbar>
```

## Next Step...

Check the [API documentation](api.md).


## Related Projects

- [react-smooth-scrollbar](https://github.com/idiotWu/react-smooth-scrollbar)
