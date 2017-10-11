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

## How to disable this plugin

Simply set `plugin.overscroll=false` when initializing scrollbars:

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
