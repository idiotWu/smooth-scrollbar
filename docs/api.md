# APIs

> This is the API documentation for `smooth-scrollbar@8.x`, check [here](https://github.com/idiotWu/smooth-scrollbar/tree/7.x) for the docs of version 7.x.

> Looking for migration guides? See [migration guide](migration.md) for details.

In this documentation, we are using `Scrollbar` (in capitalized) to represent the constructor and `scrollbar` (in lowercase) for the instance object.

## Table of Contents

- [Static Methods](#static-methods)
  - [Scrollbar.init()](#scrollbarinit)
  - [Scrollbar.initAll()](#scrollbarinitall)
  - [Scrollbar.has()](#scrollbarhas)
  - [Scrollbar.get()](#scrollbarget)
  - [Scrollbar.getAll()](#scrollbargetall)
  - [Scrollbar.destroy()](#scrollbardestroy)
  - [Scrollbar.destroyAll()](#scrollbardestroyall)
  - [Scrollbar.use()](#scrollbaruse)
  - [Scrollbar.attachStyle()](#scrollbarattachstyle)
  - [Scrollbar.detachStyle()](#scrollbardetachstyle)
- [Instance Properties and Methods](#instance-properties-and-methods)
  - [scrollbar.containerEl](#scrollbarcontainerel)
  - [scrollbar.contentEl](#scrollbarcontentel)
  - [scrollbar.options](#scrollbaroptions)
  - [scrollbar.size](#scrollbarsize)
  - [scrollbar.offset](#scrollbaroffset)
  - [scrollbar.limit](#scrollbarlimit)
  - [scrollbar.scrollLeft](#scrollbarscrollleft)
  - [scrollbar.scrollTop](#scrollbarscrolltop)
  - [scrollbar.track](#scrollbartrack)
  - [scrollbar.getSize()](#scrollbargetsize)
  - [scrollbar.update()](#scrollbarupdate)
  - [scrollbar.setPosition()](#scrollbarsetposition)
  - [scrollbar.scrollTo()](#scrollbarscrollto)
  - [scrollbar.scrollIntoView()](#scrollbarscrollintoview)
  - [scrollbar.isVisible()](#scrollbarisvisible)
  - [scrollbar.addMomentum()](#scrollbaraddmomentum)
  - [scrollbar.setMomentum()](#scrollbarsetmomentum)
  - [scrollbar.updatePluginOptions()](#scrollbarupdatepluginoptions)
  - [scrollbar.addListener()](#scrollbaraddlistener)
  - [scrollbar.removeListener()](#scrollbarremovelistener)
  - [scrollbar.destroy()](#scrollbardestroy-1)

## Static Methods

### Scrollbar.init()

```js
Scrollbar.init(elem, options?): Scrollbar
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | Element | The DOM element that you want to initialize scrollbar to. |
| `options` | `object`, _optional_ | Initial options, see [Available Options for Scrollbar](README.md#available-options-for-scrollbar) section above. |

Initializes a scrollbar on the given element and returns scrollbar instance:

```js
const scrollbar = Scrollbar.init(document.body, {
  damping: 0.2,
});
```

### Scrollbar.initAll()

```js
Scrollbar.init(options?): Scrollbar[]
```

| Param | Type | Description |
| --- | :-: | --- |
| `options` | `object`, _optional_ | Initial options, see [Available Options for Scrollbar](README.md#available-options-for-scrollbar) section above. |

Automatically init scrollbar on all elements base on the selector `[data-scrollbar]`, returns an array of scrollbars:

```html
<div data-scrollbar> ... </div>

<article data-scrollbar> ... </article>
```

```js
Scrollbar.initAll(); // [ SmoothScrollbar, SmoothScrollbar ]
```

### Scrollbar.has()

```js
Scrollbar.has(elem): boolean
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | `HTMLElement` | The DOM element that you want to check. |

Checks if there is a scrollbar on given element:

```js
Scrollbar.init(document.body);

Scrollbar.has(document.body); // true
```

### Scrollbar.get()

```js
Scrollbar.get(elem): Scrollbar
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | `HTMLElement` | The DOM element that you want to check. |

Gets scrollbar on the given element. If no scrollbar instance exsits, returns `undefined`:

```js
const scrollbar = Scrollbar.init(document.body);

Scrollbar.get(document.body) === scrollbar; // true

Scrollbar.get(document.documentElement); // undefined
```

### Scrollbar.getAll()

```js
Scrollbar.getAll(): SmoothScrollbar[]
```

Returns an array that contains all scrollbar instances:

```js
Scrollbar.getAll(); // [ SmoothScrollbar, SmoothScrollbar, ... ]
```

### Scrollbar.destroy()

```js
Scrollbar.destroy(elem): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | `HTMLElement` | The DOM element that scrollbar is initialized to. |

Removes scrollbar on the given element:

```js
Scrollbar.init(document.body);
Scrollbar.has(document.body); // true

Scrollbar.destroy(document.body);
Scrollbar.has(document.body); // false
```

### Scrollbar.destroyAll()

```js
Scrollbar.destroyAll(): void
```

Removes all scrollbar instances from current document.

### Scrollbar.use()

```js
Scrollbar.use(...Plugins: ScrollbarPluginClass[]): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `Plugin` | `ScrollbarPluginClass` | Scrollbar plugin class. |

Attaches plugins to scrollbars. See [Plugin System](plugin.md);

```js
import Scrollbar, { ScrollbarPlugin } from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugin/overscroll';

class MyPlugin extends ScrollbarPlugin {
  ...
}

Scrollbar.use(MyPlugin, OverscrollPlugin);
```

### Scrollbar.attachStyle()

Attaches default style sheets to current document. You don't need to call this method manually unless you removed the default styles via `Scrollbar.detachStyle()`;

### Scrollbar.detachStyle()

Removes default styles from current document. Use this method when you want to use your own css for scrollbars.

## Instance Properties and Methods

A scrollbar instance is what you get from `Scrollbar.init()` method:

```js
const scrollbar = Scrollbar.init(elem);
```

### scrollbar.containerEl

- Type: `HTMLElement`

The element that you initialized scrollbar to:

```js
const scrollbar = Scrollbar.init(elem);

console.log(scrollbar.containerEl === elem); // true
```

### scrollbar.contentEl

- Type: `HTMLElement`

The wrapper element that contains your contents:

```js
const scrollbar = Scrollbar.init(elem);

console.log(scrollbar.contentEl.className); // 'scroll-content'
```

### scrollbar.options

- Type: `ScrollbarOptions`

Options for current scrollbar instance:

```ts
type ScrollbarOptions = {
  damping: number,
  thumbMinSize: number,
  renderByPixels: boolean,
  alwaysShowTracks: boolean,
  continuousScrolling: boolean,
  wheelEventTarget: EventTarget | null,
  plugins: any,
};
```

### scrollbar.size

- Type: `ScrollbarSize`

Geometry infomation for current scrollbar instance:

```ts
type ScrollbarSize = {
  container: {
    width: number,
    height: number,
  },
  content: {
    width: number,
    height: number,
  },
};
```

### scrollbar.offset

- Type: `{ x: number, y: number }`

Current scrolling offsets:

```js
console.log(scrollbar.offset); // { x: 123, y: 456 }
```

### scrollbar.limit

- Type: `{ x: number, y: number }`

Max-allowed scrolling offsets:

```js
console.log(scrollbar.limit); // { x: 1000, y: 1000 }
```

### scrollbar.scrollLeft

- Type: `number`

**Gets or sets** `scrollbar.offset.x`:

```js
console.log(scrollbar.scrollLeft); // 123
console.log(scrollbar.scrollLeft === scrollbar.offset.x); // true

scrollbar.scrollLeft = 1024; // setPosition(1024, offset.y);
console.log(scrollbar.offset.x); // 1024
```

### scrollbar.scrollTop

- Type: `number`

**Gets or sets** `scrollbar.offset.y`:

```js
console.log(scrollbar.scrollTop); // 456
console.log(scrollbar.scrollTop === scrollbar.offset.y); // true

scrollbar.scrollTop = 2048; // setPosition(offset.x, 2048);
console.log(scrollbar.offset.y); // 2048
```

### scrollbar.track

- Type: `TrackController`

Details:

```ts
interface TrackController {
  readonly xAxis: ScrollbarTrack;
  readonly yAxis: ScrollbarTrack;

  /**
   * Updates track appearance
   */
  update(): void;

  /**
   * Automatically hide tracks when scrollbar is in idle state
   */
  autoHideOnIdle(): void;
}

interface ScrollbarTrack {
  /**
   * Track element
   */
  readonly element: HTMLElement;

  readonly thumb: ScrollbarThumb;

  /**
   * Show track immediately
   */
  show(): void;

  /**
   * Hide track immediately
   */
  hide(): void;
}

interface ScrollbarThumb {
  /**
   * Thumb element
   */
  readonly element: HTMLElement;

  /**
   * Display size of the thumb
   * will always be greater than `scrollbar.options.thumbMinSize`
   */
  displaySize: number;

  /**
   * Actual size of the thumb
   */
  realSize: number;

  /**
   * Thumb offset to the top
   */
  offset: number;
}
```

Example:

```js
scrollbar.track.update();
scrollbar.track.xAxis.show();
```

### scrollbar.getSize()

```js
scrollbar.getSize(): ScrollbarSize
```

Returns the size of the scrollbar container element and the content wrapper element, it may be something like this:

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

### scrollbar.update()

```js
scrollbar.update(): void
```

Forces scrollbar to update geometry infomation.

By default, scrollbars are automatically updated with `100ms` debounce (or `MutationObserver` fires). You can call this method to force an update when you modified contents:

```js
// append some contents to the scrollbar element...
scrollbar.contentEl.appendChild(awesome);

// force an update
scrollbar.update();
```

### scrollbar.setPosition()

```js
scrollbar.setPosition(x, y, options?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | `number` | Scrolling offset in x-axis. |
| `y` | `number` | Scrolling offset in y-axis. |
| options | `SetPositionOptions`, _optional_ | See details below. |

Detail:

```ts
type SetPositionOptions = {
  /**
   * Disable callback functions temporarily.
   * When set to `true`, scrolling listener will not be invoked this time
   */
  withoutCallbacks: boolean,
};
```

Likes the `window.scrollTo()` method, you can use this method to set the scrollbar to the given offset **without easing**:

```js
// limit = { x: 500, y: 500 }
scrollbar.setPosition(100, 100);
console.log(scrollbar.offset); // { x: 100, y: 100 }
```

If the offset is out of limitation, it will be clamped:

```js
// scroll.limit = { x: 0, y: 100 }
scrollbar.setPosition(1024, 1024);
console.log(scrollbar.offset); // { x: 0, y: 100 }
```

### scrollbar.scrollTo()

```js
scrollbar.scrollTo(x, y, duration?, options?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | `number` | Scrolling offset in x-axis. |
| `y` | `number` | Scrolling offset in y-axis. |
| `duration` | `number`, _optional_ | Easing duration, default is `0` (non-easing). |
| `options` | `ScrollToOptions`, _optional_ | See details below. |

Details:

```ts
type ScrollToOptions = {
  /**
   * Callback function that will be invoked when easing animation is done
   */
  callback: (this: Scrollbar) => void,

  /**
   * Custom easing function, default is `easeOutCubic`.
   * You can find more easing function on <https://github.com/danro/easing-js>
   */
  easing: (percent: number) => number;
};
```

Scrolls to given position with easing function:

```js
import easing from 'easing-js';

scrollbar.scrollTo(0, 100, 600);
scrollbar.scrollTo(0, 100, 600, {
  callback: () => console.log('done!'),
  easing: easing.easeOutBack,
});
```

### scrollbar.scrollIntoView()

```js
scrollbar.scrollIntoView(elem, options?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | `HTMLElement` | Target element. |
| `options` | `object`, _optional_ | See details below. |

Details:

```ts
type ScrollIntoViewOptions = {
  /**
   * Whether to align to the top or the bottom edge of container.
   */
  alignToTop: boolean = true,

  /**
   * Set to true to prevent scrolling when target element is visible.
   */
  onlyScrollIfNeeded: boolean = false,

  /**
   * Offset to left edge of container.
   */
  offsetLeft: number = 0,

  /**
   * Offset to top edge of container (used only if `alignToTop=true`)
   */
  offsetTop: number = 0,

  /**
   * Offset to bottom edge of container (used only if `alignToTop=false`).
   */
  offsetBottom: number = 0,
};
```

Scrolls the target element into visible area of scrollbar, likes DOM method [`element.scrollIntoView()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView). This method will be helpful when you want to create some anchors.

```js
scrollbar.scrollIntoView(document.querySelector('#anchor'), {
  offsetLeft: 34,
  offsetBottom: 12,
  alignToTop: false,
  onlyScrollIfNeeded: true,
});
```

### scrollbar.isVisible()

```js
scrollbar.isVisible(elem): boolean
```

| Param | Type | Description |
| --- | :-: | --- |
| `elem` | `HTMLElement` | Target element. |

Checks if an element is visible in the current view area.

```js
scrollbar.isVisible(document.querySelector('#greet'));
```


### scrollbar.addMomentum()

```js
scrollbar.addMomentum(x, y): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | `number` | Momentum in x-axis. |
| `y` | `number` | Momentum in y-axis. |

Increases scrollbar's momentum. This method will **NOT** fire `plugin.trasformDelta()` hook.

```js
scrollbar.addMomentum(100, 100);
```

### scrollbar.setMomentum()

```js
scrollbar.setMomentum(x, y): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `x` | `number` | Momentum in x-axis. |
| `y` | `number` | Momentum in y-axis. |

Sets scrollbar's momentum to given value. This method will **NOT** fire `plugin.trasformDelta()` hook.

```js
scrollbar.setMomentum(100, 100);
```

### scrollbar.updatePluginOptions()

> This method is available since `8.1.0`.

```js
scrollbar.updatePluginOptions(pluginName, options): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `pluginName` | `string` | Name of the plugin. |
| `options` | `object` | An object includes the properties that you want to update. |

Updates options for specific plugin.

```js
scrollbar.updatePluginOptions('overscroll', {
  effect: 'glow',
});
```

### scrollbar.addListener()

```js
scrollbar.addListener(listener): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `listener` | `ScrollListener` | Scrolling event listener, see details below. |

Details:

```ts
interface ScrollListener {
  (this: Scrollbar, status: ScrollStatus): void;
}

type ScrollStatus = {
  // equal to `scrollbar.offset`
  offset: {
    x: number,
    y: number,
  },
  // equal to `scrollbar.limit`
  limit: {
    x: number,
    y: number,
  },
};
```

Since scrollbars will not fire a native `scroll` event, we need to registers scrolling listeners through `scrollbar.addListener()` method.

> **Notice**: the callback functions will be invoked in every small scrolling, so be careful not to add time-consuming listeners which will slow down scrolling.

```js
scrollbar.addListener((status) => {
  ...
});
```

### scrollbar.removeListener()

```js
scrollbar.removeListener(listener): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `listener` | `ScrollListener` | The registered listener function. |

Removes listener previously registered with `scrollbar.addListener()`, just likes the DOM method [`EventTarget.removeEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener).

```js
function listener(status) {
  // ...
}

scrollbar.addListener(listener);
scrollbar.removeListener(listener);
```

### scrollbar.destroy()

```js
scrollbar.destroy(): void
```

Removes this scrollbar instance and restores DOM:

Before:

```html
<section data-scrollbar style="overflow: hidden">
  <div class="scroll-content">
    ...
  </div>

  <div class="scrollbar-track scrollbar-track-x">
    <div class="scrollbar-thumb scrollbar-thumb-x"></div>
  </div>
  <div class="scrollbar-track scrollbar-track-y">
    <div class="scrollbar-thumb scrollbar-thumb-y"></div>
  </div>
</section>
```

After:

```html
<section data-scrollbar>
  ...
</section>
```
