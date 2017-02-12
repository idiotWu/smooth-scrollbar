# Smooth Scrollbar

[![npm](https://img.shields.io/npm/v/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![npm](https://img.shields.io/npm/dt/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![npm](https://img.shields.io/npm/l/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![Travis](https://img.shields.io/travis/idiotWu/smooth-scrollbar.svg)](https://travis-ci.org/idiotWu/smooth-scrollbar)

Smooth scrolling in modern browsers.

## Table of Contents
- [Install](#install)
- [Browser Compatibility](#browser-compatibility)
- [Demo](#demo)
- [Why is native scrolling slow?](#why-is-native-scrolling-slow)
- [Usage](#usage)
- [Available Options for Scrollbar](#available-options-for-scrollbar)
- [DOM Structure](#dom-structure)
- [APIs](#apis)
   - [Static Methods](#static-methods)
      - [Scrollbar.init()](#scrollbarinit)
      - [Scrollbar.initAll()](#scrollbarinitall)
      - [Scrollbar.has()](#scrollbarhas)
      - [Scrollbar.get()](#scrollbarget)
      - [Scrollbar.getAll()](#scrollbargetall)
      - [Scrollbar.destroy()](#scrollbardestroy)
      - [Scrollbar.destroyAll()](#scrollbardestroyall)
   - [Instance Properties and Methods](#instance-properties-and-methods)
      - [scrollbar.targets](#scrollbartargets)
      - [scrollbar.offset](#scrollbaroffset)
      - [scrollbar.limit](#scrollbarlimit)
      - [scrollbar.scrollTop](#scrollbarscrolltop)
      - [scrollbar.scrollLeft](#scrollbarscrollleft)
      - [scrollbar.update()](#scrollbarupdate)
      - [scrollbar.getSize()](#scrollbargetsize)
      - [scrollbar.setPosition()](#scrollbarsetposition)
      - [scrollbar.scrollTo()](#scrollbarscrollto)
      - [scrollbar.addListener()](#scrollbaraddlistener)
      - [scrollbar.scrollIntoView()](#scrollbarscrollintoview)
      - [scrollbar.isVisible()](#scrollbarisvisible)
      - [scrollbar.infiniteScroll()](#scrollbarinfinitescroll)
      - [scrollbar.stop()](#scrollbarstop)
      - [scrollbar.destroy()](#scrollbardestroy-1)
- [Common mistakes](#common-mistakes)
- [FAQ](#faq)
- [Related Projects](#related-projects)

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
var Scrollbar = window.Scrollbar;
```

Don't forget to include the stylesheet in your page:

```html
<link rel="stylesheet" href="dist/smooth-scrollbar.css">
```

There are three ways to tell the plugin which element should be a smooth scrollbar:

1. As an element:

    ```html
    <scrollbar>...</scrollbar>
    ```

2. As an attribute:

    ```html
    <section scrollbar>...</section>
    ```

3. As a data attribute

    ```html
    <section data-scrollbar>...</section>
    ```

Then init all scrollbars:

```javascript
Scrollbar.initAll(options);
```

Or you can call `Scrollbar.init(elem, options)` to manually init the scrollbar:

```js
Scrollbar.init(document.getElementById('my-scrollbar'), options);
```

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
Following is the DOM structure that Scrollbar yields:

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

In this documentation, we are using `Scrollbar` (in capitalized) to represent the constructor and `scrollbar` (in lowercase) for the instance object.

### Static Methods

#### Scrollbar.init()

```js
Scrollbar.init(elem, options?): SmoothScrollbar
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | The DOM element that you want to initialize scrollbar to. |
| `options` | object, _optional_ | Initial options, see [Available Options for Scrollbar](#available-options-for-scrollbar) section above. |

Initializes a scrollbar on the given element and returns scrollbar instance:

```js
var scrollbar = Scrollbar.init(document.body, { speed: 0.75 });
```

#### Scrollbar.initAll()

```js
Scrollbar.init(options): [SmoothScrollbar]
```

| Param | Type | Description |
| --- | :-: | --- |
| `options` | object, _optional_ | Initial options, see [Available Options for Scrollbar](#available-options-for-scrollbar) section above. |

Automatically init scrollbar on all elements refer to the selector `scrollbar, [scrollbar], [data-scrollbar]`, returns an array of scrollbars collection:

```html
<scrollbar> ... </scrollbar>

<article scrollbar> ... </article>

<article data-scrollbar> ... </article>
```

```js
Scrollbar.initAll(); // [ SmoothScrollbar, SmoothScrollbar, SmoothScrollbar ]
```

#### Scrollbar.has()

```js
Scrollbar.has(elem): boolean
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | The DOM element that you want to check. |

Check if scrollbar exists on given element:

```js
Scrollbar.init(document.body);

Scrollbar.has(document.body); // true
```

#### Scrollbar.get()

```js
Scrollbar.get(elem): SmoothScrollbar
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | The DOM element that you want to check. |

Get scrollbar on the given element, if no scrollbar instance exsits, return `undefined`:

```js
var scrollbar = Scrollbar.init(document.body);

Scrollbar.get(document.body) === scrollbar; // true

Scrollbar.get(document.documentElement); // undefined
```

#### Scrollbar.getAll()

```js
Scrollbar.getAll(): [SmoothScrollbar]
```

Return an array that contains all scrollbar instances:

```js
Scrollbar.getAll(); // [ SmoothScrollbar, SmoothScrollbar, ... ]
```

#### Scrollbar.destroy()

```js
Scrollbar.destroy(elem): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | The DOM element that scrollbar is initialized to. |

Remove scrollbar on the given element.

#### Scrollbar.destroyAll()

```js
Scrollbar.destroyAll(): void
```

Remove all scrollbar instances from current page.

### Instance Properties and Methods

A scrollbar instance refer to what you get from `Scrollbar.init()` method:

```js
var scrollbar = Scrollbar.init(elem)
```

#### scrollbar.targets

- Type: `object`

An object that contains main parts of current scrollbar:

```js
{
    container,
    content,
    xAxis: { track, thumb },
    yAxis: { track, thumb }
}
```

#### scrollbar.offset

- Type: `object`

Current scrolling offset:

```js
console.log(scrollbar.offset); // { x: 123, y: 456 }
```

#### scrollbar.limit

- Type: `object`

Max-allowed scrolling distance:

```js
console.log(scrollbar.limit); // { x: 1000, y: 1000 }
```

#### scrollbar.scrollTop

- Type: `number`

Alias for `scrollbar.offset.y`:

```js
console.log(scrollbar.scrollTop); // 123

console.log(scrollbar.scrollTop === scrollbar.offset.y); // true
```

#### scrollbar.scrollLeft

- Type: `number`

Alias for `scrollbar.offset.x`:

```js
console.log(scrollbar.scrollLeft); // 456

console.log(scrollbar.scrollLeft === scrollbar.offset.x); // true
```

#### scrollbar.update()

```js
scrollbar.update(async?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `async` | boolean, _optional_ | Force an asynchronous update. |

Forces scrollbar to update metrics.

By default, scrollbars are automatically updated with 100ms debounce (or `childList` changes if `MutationObserver` is supported). You can call this method to force an update when you modified contents inside scrollbar:

```js
// append some contents to the scrollbar element...

// force an update
scrollbar.update();

// force an asynchronous update
scrollbar.update(true);
```

#### scrollbar.getSize()

```js
scrollbar.getSize(): object
```

Return the size of scrollbar container element and scroll content element, it may be something like this:

```js
{
    container: {
        width: 600,
        height: 400
    },
    content: {
        width: 1000,
        height: 3000
    }
}
```

#### scrollbar.setPosition()

```js
scrollbar.setPosition(x, y): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | number | Scrolling offset in x-axis. |
| `y` | number | Scrolling offset in y-axis. |

Likes the `window.scrollTo()` method, use this method to set the scrollbar to the given offset **without easing**:

```js
// limit = { x: 500, y: 500 }
scrollbar.setPosition(100, 100);
console.log(scrollbar.offset); // { x: 100, y: 100 }
```

If the offset is out of limitation, it will be shrinked:

```js
// limit = { x: 0, y: 100 }
scrollbar.setPosition(1024, 1024);
console.log(scrollbar.offset); // { x: 0, y: 100 }
```

#### scrollbar.scrollTo()

```js
scrollbar.scrollTo(x, y, duration?, callback?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | number | Scrolling offset in x-axis. |
| `y` | number | Scrolling offset in y-axis. |
| `duration` | number, _optional_ | Easing duration, default is `0` (non-easing). |
| `callback` | function, _optional_ | Callback function that will be fired on the end of scrolling. |

Scrolls to given position with quadratic easing function:

```js
scrollbar.scrollTo(100, 100, 300, function (scrollbar) {
    // ...
});
```

#### scrollbar.addListener()

```js
scrollbar.addListener(listener): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `listener` | (status) => void | Scrolling event listener. |


Since scrollbars will not fire a native `scroll` event, we need to registers thought `scrollbar.addListener()` method.

**Notice**: the callback functions will be invoked in every small scrolling, so be careful not to add time-consuming listeners that will slow down scrolling.

The `status` object contains following properties:

```js
{
    direction: {
        // scrolling direction compares to the last offset
        x: 'none' | 'right' | 'left',
        y: 'none' | 'up' | 'down',
    },
    offset: {
        // current scrolling offset, equivalent to `scrollbar.offset`
        x: number,
        y: number,
    },
    limit: {
        // max-allowed scrolling distance, equivalent to `scrollbar.limit`
        x: number,
        y: number,
    }
}
```

#### scrollbar.scrollIntoView()

```js
scrollbar.scrollIntoView(elem, options?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | Target element. |
| `options` | object, _optional_ | Scrolling options, see the table below. |

| Property | type | default | description |
| :-------: | :--: | :-----: | :---------- |
| `offsetTop` | number | `0` | Offset to top edge of container. |
| `offsetLeft` | number | `0` | Offset to left edge of container. |
| `onlyScrollIfNeeded` | boolean | `false` | Whether to scroll container when target element is visible. |

Scrolls the target element into visible area of scrollbar, like DOM method [`element.scrollIntoView()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView). This will be helpful when you want to create some anchors.

```js
scrollbar.scrollIntoView(document.getElementById('a-section'), {
    offsetTop: 12,
    offsetLeft: 34,
    onlyScrollIfNeeded: true,
});
```

#### scrollbar.isVisible()

```js
scrollbar.isVisible(elem): boolean
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | Target element. |

Checks if an element is visible in the current view area.

```js
scrollbar.isVisible(document.getElementById('greet'))
```

#### scrollbar.infiniteScroll()

```js
scrollbar.infiniteScroll(handler, threshold?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `handler` | (status) => void | Infinite scrolling handler. |
| `threshold` | number, _optional_ | Represents the trigger offset to the bottom edge of current scrollbar, default is `50`. |

This is another useful method when you want to make infinite scrolling. Handlers will be invoked with the `status` object when you scrolling down over the given `threshold`:

```js
instance.infiniteScroll(function (status) {
    // ...
}, 100);
```

#### scrollbar.stop()

```js
scrollbar.stop(): void
```

Clears all pending movements and stops scrolling **immediately**.

```js
// offset = { x: 0, y: 0 }
scrollbar.scrollTo(100, 100);
scrollbar.stop();

console.log(scrollbat.offset); // { x: 0, y: 0 }
```

#### scrollbar.destroy()

```js
scrollbar.destroy(): void
```

Remove this scrollbar instance:

Before:

```html
<section data-scrollbar style="overflow: hidden">
    <article class="scroll-content">
        ...
    </article>

    <aside class="scrollbar-track scrollbar-track-x">
        <div class="scrollbar-thumb scrollbar-thumb-x"></div>
    </aside>
    <aside class="scrollbar-track scrollbar-track-y">
        <div class="scrollbar-thumb scrollbar-thumb-y"></div>
    </aside>
</section>
```

After:

```html
<section data-scrollbar>
    ...
</section>
```

## Common mistakes

### Initialize a scrollbar without a limited width or height

Likes the native scrollbars, a scrollable area means **the content insides it is larger than the container itself**, for example, a `500*500` area with a content which size is `1000*1000`.

Therefore, it necessary to set the `width` or `height` for the container element:

```css
#my-scrollbar {
    width: 500px;
    height: 500px;
    overflow: auto;
}
```

## FAQ

### How to listen to the `scroll` event?

Since scrollbars will not fire a native `scroll` event, we need to registers thought [`scrollbar.addListener()`](#scrollbar-addlistener) method:

```js
scrollbar.addListener(function (status) {
    // ...
});
```

## Related Projects

- [angular-smooth-scrollbar](https://github.com/idiotWu/angular-smooth-scrollbar)
- [react-smooth-scrollbar](https://github.com/idiotWu/react-smooth-scrollbar)

## Contributing

- Create an issue with an example on [jsbin.com](http://jsbin.com/), including latest version of `smooth-scrollbar` through:
    ```html
    <link rel="stylesheet" href="https://unpkg.com/smooth-scrollbar@latest/dist/smooth-scrollbar.css">

    <script src="https://unpkg.com/smooth-scrollbar@latest/dist/smooth-scrollbar.js"></script>
    ```

- Run your forks locally with following steps:

    1. Clone the repo: `git clone https://github.com/idiotWu/smooth-scrollbar.git`,
    2. Install dependencies: `npm run install`,
    3. Start server: `npm start`.

Before making pull requests, make sure you have run `npm test`!

## License

MIT.
