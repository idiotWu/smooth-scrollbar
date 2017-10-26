# Overscroll Plugin

Overscroll plugin provides the macOS style overscroll bouncing effect and Android style glow effect.

## Usage

```js
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';

Scrollbar.use(OverscrollPlugin);

Scrollbar.init(elem, {
  plugins: {
    overscroll: options | false,
  },
});
```

OR

```html
<script src="dist/smooth-scrollbar.js"></script>
<script src="dist/plugins/overscroll.js"></script>

<script>
  var Scrollbar = window.Scrollbar;

  Scrollbar.use(window.OverscrollPlugin)

  Scrollbar.init(elem, {
    plugins: {
      overscroll: options | false,
    },
  });
</script>
```


## Available Options

| parameter | type | default | description |
| :--------: | :--: | :-----: | :---------- |
| effect | `'bounce'` &#124; `'glow'` | `'bounce'` | Overscroll effect, `'bounce'` for iOS style effect and `'glow'` for Android style effect.|
| damping | `number` | `0.2` | Momentum reduction damping factor, a float value between `(0, 1)`. The lower the value is, the more smooth the overscrolling will be (also the more paint frames). |
| maxOverscroll | `number` | `150` | Max-allowed overscroll distance. |
| glowColor | `string` | `'#87ceeb'` | Canvas paint color for `'glow'` effect. |
| onScroll | `function` | `null` | See details below. **This option is available since `8.2.0`** |

### options.onScroll

```ts
onScroll(this: OverscrollPlugin, position: Position): void

type Position = {
  x: number,
  y: number,
};
```

You can listen to overscroll events by setting `options.onScroll`:

```js
{
  plugins: {
    overscroll: {
      onScroll(position) {
        console.log(posision); // > { x: 12, y: 34 }
      }
    }
  }
}
```

The `position` parameter is a x,y coordinate that indicates current overscroll position:

```
* MAX stands for options.maxOverscroll

                 y: [-MAX, 0]
                      ↑
               +--------------+
               |  scrollable  |
x: [-MAX, 0] ← |      +       | → x: [0, MAX]
               |     area     |
               +--------------+
                      ↓
                 y: [0, MAX]
```

## How to disable this plugin

Simply set `plugins.overscroll=false` when initializing scrollbars:

```js
Scrollbar.init(elem, {
  plugins: {
    // overscroll plugin will NEVER be constructed on this scrollbar!
    overscroll: false,
  },
});
```

## Online Demo

[http://idiotwu.github.io/smooth-scrollbar/](http://idiotwu.github.io/smooth-scrollbar/)
