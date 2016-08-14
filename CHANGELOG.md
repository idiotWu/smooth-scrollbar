## 7.2.0

- Refactor touch record.
- Add `options.overscrollDamping`.

## 7.1.0

- Add back individual style files to avoid crashing on server side rendering.

## 7.0.0

- **Breaking change**: style files are now bundled with js files!
- Support server side rendering.
- Refactored to webpack based workflow.

## 6.4.0

- Add `isRemoval` to destroy methods.


## 6.3.0

- Add `syncCallbacks` options to perform synchronous callbacks.

## 6.2.0

- Rename `options.friction` to `options.damping`.

## 6.1.0

- Fix overscroll effect on non-scrollable containers.
- Add `alwaysShowTracks` option

## 6.0.0

- Add experimental overscroll effect.

## 5.6.0

- Remove `ignoreEvents` option.
- Add `unregisterEvents` and `registerEvents` to manage events.

## 5.5.0

- Add `renderByPixels` option.

## 5.3.0

- Add `scrollIntoView()` method.

## 5.2.0

- Add `continuousScrolling` option.

## 5.1.0

- Add `#clearMovement` and `#stop` method.
- Allow users to temporarily disable callbacks when invoke `#setPosition` method.

## 5.0.0

- **Breaking change**: rename `fricton` to `friction`.
- Feature: minimal scrollbar thumb size.

## 4.2.0

- Add `ignoreEvents` support.

## 4.1.0

- Reduce movement at container's edge.

## 4.0.0

- Movement based scrolling algorithm.
- Reduce options, simple is better :)

## 3.1.0

- Use quadratic curve to perform `scrollTo` method.

## 3.0.0

- New easing algorithm.
- Dependency free!
