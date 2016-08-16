# Smooth Scrollbar

[![npm](https://img.shields.io/npm/v/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![npm](https://img.shields.io/npm/dt/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![npm](https://img.shields.io/npm/l/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![Travis](https://img.shields.io/travis/idiotWu/smooth-scrollbar.svg)](https://travis-ci.org/idiotWu/smooth-scrollbar)

- If you want **smooth scrolling**, use `smooth-scrollbar`;
- If you want **customizable scrollbars**, use `smooth-scrollbar`;
- If you want **high-performance scrollbars**, use `smooth-scrollbar`;
- If you want **incredibly prompt user support**, use `smooth-scrollbar`;
- If you want **perfect scrollbar in modern browsers**, use `smooth-scrollbar`!

So, why would you still use other scrollbar plugins? All you need is a quick setup:

## Install

Via npm:

```
npm install smooth-scrollbar --save
```

Via bower:

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

[http://idiotwu.github.io/smooth-scrollbar/](http://idiotwu.github.io/smooth-scrollbar/)

## Why is native scrolling slow?

As is explained in [this article](http://www.html5rocks.com/en/tutorials/speed/scrolling/), browser repaint every frame in scrolling. **Less painting is better.**

To avoid repainting, I use `translate3d` in scroll content to create composite layers and force hardware accelerating.

## Usage

Smooth scrollbar is defined as an UMD module which named `Scrollbar`, you can use any loader to load it:

```javascript
import Scrollbar from 'smooth-scrollbar';
```

Or get it from `window` object:

```javascript
const { Scrollbar } = window;
```

Don't forget to include the stylesheet in your page:

```html
<link rel="stylesheet" href="dist/smooth-scrollbar.css">
```

Here're three ways to tell the plugin which element should be a smooth scrollbar:

1. As an element:

    ```html
    <scrollbar>
        ...
    </scrollbar>
    ```

2. As an attribute:

    ```html
    <section scrollbar>
        ...
    </section>
    ```

3. As a data attribute

    ```html
    <section data-scrollbar>
        ...
    </section>
    ```

Then init all scrollbars:

```javascript
Scrollbar.initAll(options);
```

Or you can call `Scrollbar.init(elem, options)` to manually init the scrollbar.

## Available Options for Scrollbar

| parameter | type | default | description |
| :--------: | :--: | :-----: | :---------- |
| speed | Number | 1 | Scrolling speed scale.|
| damping | Number | 0.1 | Delta reduction damping, a float value between (0, 1), the lower the value is, the more smooth the scrolling will be. |
| thumbMinSize | Number | 20 | Minimal size for scrollbar thumb. |
| syncCallbacks | Boolean | false | Execute listeners in synchronous or asynchronous. |
| renderByPixels | Boolean | true | Render scrolling by integer pixels, set to `true` to improve performance. |
| alwaysShowTracks | Boolean | false | Keep scrollbar tracks visible whether it's scrolling or not. |
| continuousScrolling | Boolean\|String | 'auto' | Whether allow upper scrollable content to continue scrolling when current scrollbar reaches edge. **When set to 'auto', it will be enabled on nested scrollbars, and disabled on first-class scrollbars.** |
| overscrollEffect | Boolean\|String | false | Experimental overscroll effect, `'bounce'` for iOS style effect and `'glow'` for Android style effect. **Be careful when you enable this feature!** |
| overscrollEffectColor | String | '#87ceeb' | Canvas paint color with 'glow' effect. |
| overscrollDamping | Number | 0.2 | The same as `damping`, but for overscrolling. |

**Confusing with the option field? Try edit tool [here](http://idiotwu.github.io/smooth-scrollbar/)!**

## DOM Structure
Following is the DOM structure that Scrollbar generated:

```html
<scrollbar>
    <article class="scroll-content">
        your contents here...
    </article>
    <aside class="scrollbar-track scrollbar-track-x">
        <div class="scrollbar-thumb scrollbar-thumb-x"></div>
    </aside>
    <aside class="scrollbar-track scrollbar-track-y">
        <div class="scrollbar-thumb scrollbar-thumb-y"></div>
    </aside>
</scrollbar>
```

## APIs

- [Scrollbar API Documents](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods)
- [Instance API Documents](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods)

###  Scrollbar

- [Scrollbar.init( element, [options] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbarinit-element-options-)
- [Scrollbar.initAll( [options] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbarinitall-options-)
- [Scrollbar.has( element )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbarhas-element-)
- [Scrollbar.get( element )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbarget-element-)
- [Scrollbar.getAll()](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbargetall)
- [Scrollbar.destroy( element, [isRemoval] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroy-element-isremoval-)
- [Scrollbar.destroyAll( [isRemoval] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroyall-isremoval-)

### Instance

#### Properties

- [instance#targets](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancetargets)
- [instance#offset](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceoffset)
- [instance#limit](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancelimit)
- [instance#scrollTop](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancescrolltop)
- [instance#scrollLeft](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancescrollleft)

#### Methods

- [instance#update( [async] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceupdate-async-)
- [instance#getSize()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancegetsize)
- [instance#setPosition( x, y, [withoutCallbacks] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancesetposition-x-y-withoutcallbacks-)
- [instance#scrollTo( x, y, [duration], [callback] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancescrollto-x-y-duration-callback-)
- [instance#scrollIntoView( elem, [options] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancescrollintoview-elem-options-)
- [instance#isVisible( elem )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceisvisible-elem-)
- [instance#addListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceaddlistener-fn-)
- [instance#removeListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceremovelistener-fn-)
- [instance#unregisterEvents( regex [, regex [,...regex] ] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceunregisterevents-regex--regex-regex--)
- [instance#registerEvents( regex [, regex [,...regex] ] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceregisterevents-regex--regex-regex--)
- [instance#infiniteScroll( callback, [threshold] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceinfinitescroll-callback-threshold-)
- [instance#clearMovement()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#clearMovement)
- [instance#stop()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#stop)
- [instance#destroy( [isRemoval] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancedestroy-isremoval-)
- [instance#getContentElem()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancegetcontentelem)
- [instance#showTrack( [direction] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceshowtrack-direction-)
- [instance#hideTrack( [direction] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancehidetrack-direction-)

## Related

- [angular-smooth-scrollbar](https://github.com/idiotWu/angular-smooth-scrollbar)
- [react-smooth-scrollbar](https://github.com/idiotWu/react-smooth-scrollbar)

## Todo

- [x] Overscroll effect.
- [x] Webpack based workflow.
- [ ] Tests.

## Contributing

- Create an issue with an example on [jsbin.com](http://jsbin.com/), including latest version of `smooth-scrollbar` through:
    ```html
    <link rel="stylesheet" href="https://cdn.rawgit.com/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.css">

    <script src="https://cdn.rawgit.com/idiotWu/smooth-scrollbar/master/dist/smooth-scrollbar.js"></script>
    ```

- Run your forks locally with following steps:

    1. Clone the repo: `git clone https://github.com/idiotWu/smooth-scrollbar.git`,
    2. Install dependencies: `npm run install`,
    3. Start server: `npm start`.

Before making pull requests, make sure you have run `npm test`!

## License

MIT.
