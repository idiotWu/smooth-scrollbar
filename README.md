# smooth-scrollbar

[![npm](https://img.shields.io/npm/v/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![npm](https://img.shields.io/npm/l/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![devDependency Status](https://img.shields.io/david/dev/idiotWu/smooth-scrollbar.svg?style=flat-square)](https://david-dm.org/idiotWu/smooth-scrollbar#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/smooth-scrollbar.svg?style=flat-square)](https://www.npmjs.com/package/smooth-scrollbar)
[![Travis](https://img.shields.io/travis/idiotWu/smooth-scrollbar.svg)](https://travis-ci.org/idiotWu/smooth-scrollbar)

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
| iOS Safari | 7+ |

## Install

Via npm:

```
npm install smooth-scrollbar --save
```

Via bower:

```
bower install smooth-scrollbar --save
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
| :--------: | :--: | :-----: | :----------: |
| speed | Number | 1 | Scrolling speed scale.|
| friction | Number | 10 | Scrolling friction, a percentage value within (1, 100). |
| thumbMinWidth | Number | 20 | Minimal size for horizontal thumb. |
| thumbMinHeight | Number | 20 | Minimal size for vertical thumb. |
| ignoreEvents | Array | [] | A list of events names that are ignored, regex rules are supported. Details [here](https://github.com/idiotWu/smooth-scrollbar/wiki/Options-Field). |

Confusing with the option field? Try edit tool [here](http://idiotwu.github.io/smooth-scrollbar/)!

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
- [Scrollbar.destroy( element )](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroy-element-)
- [Scrollbar.destroyAll()](https://github.com/idiotWu/smooth-scrollbar/wiki/Static-Methods#scrollbardestroyall)

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
- [instance#addListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceaddlistener-fn-)
- [instance#removeListener( fn )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceremovelistener-fn-)
- [instance#infiniteScroll( callback, [threshold] )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceinfinitescroll-callback-threshold-)
- [[instance#clearMovement()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#clearMovement)]
- [[instance#stop()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#stop)]
- [instance#destroy()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancedestroy)
- [instance#getContentElem()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancegetcontentelem)
- [instance#showTrack( direction )](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceshowtrack-direction-)
- [instance#hideTrack()](https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instancehidetrack)

## Work with [RubaXa/Sortable](https://github.com/RubaXa/Sortable)

Details [here](https://github.com/idiotWu/smooth-scrollbar/wiki/Work-with-RubaXa-Sortable).

## Related

- [angular-smooth-scrollbar](https://github.com/idiotWu/angular-smooth-scrollbar)
- [react-smooth-scrollbar](https://github.com/idiotWu/react-smooth-scrollbar)

## Todo

- [ ] Overscroll effect.

## Changelog

### 5.1.0

- Add `#clearMovement` and `#stop` method.
- Allow users to temporarily disable callbacks when invoke `#setPosition` method.

### 5.0.0

- **Breaking change**: rename `fricton` to `friction`.
- Feature: minimal scrollbar thumb size.

### 4.2.0

- Add `ignoreEvents` support.

### 4.1.0

- Reduce movement at container's edge.

### 4.0.0

- Movement based scrolling algorithm.
- Reduce options, simple is better :)

### 3.1.0

- Use quadratic curve to perform `scrollTo` method.

### 3.0.0

- New easing algorithm.
- Dependency free!

## License

MIT.
