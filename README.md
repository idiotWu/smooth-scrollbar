# smooth-scrollbar

Customize scrollbar in modern browsers with smooth scrolling experience.

## Browser Compatibility

| Browser | Version |
| :------ | :-----: |
| IE      | 10+     |
| Chrome  | 22+     |
| Firefox | 16+     |
| Safari  | 8+      |
| Android Browser | 4+ |
| Chrome for Android | 32+ |
| iOS Safarri | 7+ |

## Install

```
bower install angular-smooth-scrollbar --save
```


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

Here's three way to tell the plugin which element should be a smooth scrollbar:

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
| :--------: | :--: | :-----: | :----------: |
| speed | Number | 1 | scrolling speed|
| stepLength | Number | 50 | how long each scrolling is (px/delta) |
| easingDuration | Number | 1000 | how long will easing takes after `touchend` event |
| easingCurve | String | cubic-bezier(0.1, 0.57, 0.1, 1) | easing timing function, either css `timing-function` or pre-defined curves [here](http://easings.net/en)|

## DOM Structure
Following is the DOM structure that Scrollbar generated:

```html
<scrollbar>
    <article class="scroll-content">
        your content here
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
- [Scrollbar.destroy( element )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroy-element-)
- [Scrollbar.destroyAll()](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroyall)

### Instance

- [instance#update( [callback] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceupdate-callback-)
- [instance#getSize()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancegetsize)
- [instance#setPosition( x, y )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancesetposition-x-y-)
- [instance#scrollTo( x, y, [duration], [callback] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancescrollto-x-y-duration-callback-)
- [instance#addListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceaddlistener-fn-)
- [instance#removeListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceremovelistener-fn-)
- [instance#infiniteScroll( callback, [threshold] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceinfinitescroll-callback-threshold-)
- [instance#destroy()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancedestroy)
- [instance#getContentElem()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancegetcontentelem)
- [instance#showTrack( direction )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceshowtrack-direction-)
- [instance#hideTrack()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancehidetrack)


## License

MIT.
