## [8.7.5](https://github.com/idiotWu/smooth-scrollbar/compare/v8.7.4...v8.7.5) (2022-08-02)

### Bug Fixes

- **event/select**: prevent scrolling when context menu opened, resolves #489

## [8.7.4](https://github.com/idiotWu/smooth-scrollbar/compare/v8.7.3...v8.7.4) (2022-01-22)

### Bug Fixes

- **event/touch**: reset touch trackers on `touchstart`, resolves #435

## [8.7.3](https://github.com/idiotWu/smooth-scrollbar/compare/v8.7.2...v8.7.3) (2022-01-10)

### Minor Changes

- **geometry**: use `ResizeObserver` instead of `MutationObserver` to apply automatic re-calculates. (This is a temporary optimization and we will refactor the code in v9.)

## [8.7.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.7.1...v8.7.2) (2021-12-25)

### Minor Changes

- **touch**: multiply touch moving velocity by `devicePixelRatio` on Android.

## [8.7.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.7.0...v8.7.1) (2021-12-25)

### Minor Changes

- **touch**: calculate scrolling delta based on the touch moving velocity.

## [8.7.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.6.3...v8.7.0) (2021-11-01)

### Features

- **event/mouse**: smoothen scrolling while dragging thumbs.

## [8.6.3](https://github.com/idiotWu/smooth-scrollbar/compare/v8.6.2...v8.6.3) (2021-07-30)

### Bug Fixes

- **geometry**: add container's paddings to content's size.

## [8.6.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.6.1...v8.6.2) (2021-05-04)

### Bug Fixes

- **event/select**: get new limit value when scroll function is called @longvudai [#314](https://github.com/idiotWu/smooth-scrollbar/pull/314)

## [8.6.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.6.0...v8.6.1) (2021-03-19)

### Bug Fixes

- **dependencies**: upgrade lodash-es to 4.17.21 (non-vulnerable version) @huggingpixels [#306](https://github.com/idiotWu/smooth-scrollbar/pull/306)

## [8.6.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.5.3...v8.6.0) (2021-02-01)

### Breaking Changes

- Upgrade core-js to v3. @milewski [#234](https://github.com/idiotWu/smooth-scrollbar/pull/234)

## [8.5.3](https://github.com/idiotWu/smooth-scrollbar/compare/v8.5.2...v8.5.3) (2020-09-17)

### Bug Fixes

- **events**: ignored attempt to cancel an event with `cancelable=false`. @milkamil93 [#276](https://github.com/idiotWu/smooth-scrollbar/pull/276)

## [8.5.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.5.1...v8.5.2) (2020-03-22)

### Bug Fixes

- **webpack**: make UMD build available on both browsers and Node.js. @hanjeahwan [#244](https://github.com/idiotWu/smooth-scrollbar/pull/244)


## [8.5.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.5.0...v8.5.1) (2019-12-06)

### Bug Fixes

- **keyboard**: prevent keyboard navigating on `select` field. @bbtimx [#228](https://github.com/idiotWu/smooth-scrollbar/pull/228)


## [8.5.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.4.1...v8.5.0) (2019-10-20)

### Bug Fixes

- **plugin.onDestroy**: fix typo. @adamcoulombe [#219](https://github.com/idiotWu/smooth-scrollbar/pull/219)

## [8.4.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.4.0...v8.4.1) (2019-09-16)

### Bug Fixes

- **keyboard**: detected `contentEditable` element. @Alecyrus [#210](https://github.com/idiotWu/smooth-scrollbar/pull/210)

## [8.4.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.3.1...v8.4.0) (2019-05-13)

### Feature

- Sets `tabindex` to `-1` to improve accessibility. [#160](https://github.com/idiotWu/smooth-scrollbar/pull/160)
- Enables <kbd>tab</kbd> navigation. [#160](https://github.com/idiotWu/smooth-scrollbar/pull/160)

## [8.3.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.3.0...v8.3.1) (2018-08-17)

### Bug Fixes

- **scrollTo**: cancel previous animation. [#168](https://github.com/idiotWu/smooth-scrollbar/issues/168)

## [8.3.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.0...v8.3.0) (2018-06-16)

### Bug Fixes

- **scrollIntoView**: fix `offsetBottom` calculation.
- **events**: add passive event detection.

### Feature

- **options**: add `delegateTo` option. [#162](https://github.com/idiotWu/smooth-scrollbar/issues/162)

## [8.2.7](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.6...v8.2.7) (2018-03-15)

### Bug Fixes

- **event/select**: remove `user-select` rules. [#151](https://github.com/idiotWu/smooth-scrollbar/issues/151)

## [8.2.6](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.5...v8.2.6) (2018-02-07)

### Bug Fixes

- **scrollIntoView**: clamp delta within scrollable offset.

## [8.2.5](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.4...v8.2.5) (2017-11-28)

### Bug Fixes

- **event/wheel**: fix wheel event name in IE10. [#124](https://github.com/idiotWu/smooth-scrollbar/pull/124)

## [8.2.4](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.3...v8.2.4) (2017-11-17)

### Bug Fixes

- **event**: fix event propagation.

## [8.2.3](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.2...v8.2.3) (2017-11-17)

### Bug Fixes

- **event**: call `event.preventDefault()` only in touchmove events.

## [8.2.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.1...v8.2.2) (2017-11-17)

### Minor Changes

- **utils/eventHub**: remove `defaultPrevented` filter.

## [8.2.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.2.0...v8.2.1) (2017-11-16)

### Bug Fixes

- **shouldPropagateMomentum**: call `shouldPropagateMomentum` after delta is transformed. [#117](https://github.com/idiotWu/smooth-scrollbar/issues/117)

## [8.2.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.0...v8.2.0) (2017-10-26)

### New Features

- **plugin/overscroll**: add `onScroll` option. [doc](https://github.com/idiotWu/smooth-scrollbar/blob/develop/docs/overscroll.md#optionsonscroll)

### Minor Changes

- **event/touch**: use platform based easing multiplier.

## [8.1.12](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.11...v8.1.12) (2017-10-25)

### Minor Changes

- **event/touch**: use `devicePixelRatio` as easing multiplier.

## [8.1.11](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.9...v8.1.11) (2017-10-23)

### Minor Changes

- **event/touch**: 1.5x easing velocity.

## [8.1.9](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.8...v8.1.9) (2017-10-23)

### Minor Changes

- **Scrollbar**: add `Scrollbar.version`.
- **event/touch**: improve velocity based easing algorithm.

## [8.1.8](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.7...v8.1.8) (2017-10-20)

### Bug Fixes

- **track**: show track on init when `alwaysShowTracks=true`. [#108](https://github.com/idiotWu/smooth-scrollbar/issues/108)
- **plugin/overscroll**: hide canvas on init. [#109](https://github.com/idiotWu/smooth-scrollbar/issues/109)

## [8.1.7](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.6...v8.1.7) (2017-10-19)

### Bug Fixes

- **plugin**: `plugin.options = new Object`.

## [8.1.6](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.4...v8.1.6) (2017-10-17)

### Minor Changes

- **addListener**: add type check.
- **plugin**: remove lazy init.
- **events**: force an update when scrollbar is detected as "unscrollable". [#106](https://github.com/idiotWu/smooth-scrollbar/issues/106)

## [8.1.4](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.3...v8.1.4) (2017-10-14)

### Bug Fixes

- **options**: make properties enumerable.

## [8.1.3](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.2...v8.1.3) (2017-10-10)

### Bug Fixes

- **plugin/overscroll**: preserve touch position when touch ends.

## [8.1.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.1...v8.1.2) (2017-10-10)

### Bug Fixes

- **plugin/overscroll**: reduce amplitude when scrollbar is scrolling back.

## [8.1.1](https://github.com/idiotWu/smooth-scrollbar/compare/v8.1.0...v8.1.1) (2017-10-10)

### Bug Fixes

- **init**: preserve scrolling position

## [8.1.0](https://github.com/idiotWu/smooth-scrollbar/compare/v8.0.2...v8.1.0) (2017-10-10)

## New Features

- **plugin system**: add `scrollbar.updatePluginOptions` method.

## [8.0.2](https://github.com/idiotWu/smooth-scrollbar/compare/v8.0.0...v8.0.2) (2017-10-09)

### Bug Fixes

- **touch**: restore damping factor when all pointers are released

## [8.0.0](https://github.com/idiotWu/smooth-scrollbar/compare/v7.4.1...v8.0.0) (2017-10-09)

### Breaking Changes

- Refactored with TypeScript.
- Removed overscroll effect from bundle.
- [...more](https://github.com/idiotWu/smooth-scrollbar/blob/develop/docs/migration.md)

### Bug Fixes

- **track**: prevent contents being selected while dragging. [#48](https://github.com/idiotWu/smooth-scrollbar/issues/48)
- **IE/touch**: enable touch event capturing in IE11. [#39](https://github.com/idiotWu/smooth-scrollbar/issues/39)

### New Features

- [Plugin System](https://github.com/idiotWu/smooth-scrollbar/blob/develop/docs/plugin.md).

## [7.4.1](https://github.com/idiotWu/smooth-scrollbar/compare/v7.4.0...v7.4.1) (2017-08-31)

### Bug Fixes

- **scrollTo**: fix scrolling curve while `duration=0`. [#94](https://github.com/idiotWu/smooth-scrollbar/issues/94)

## [7.4.0](https://github.com/idiotWu/smooth-scrollbar/compare/v7.3.1...v7.4.0) (2017-08-24)

### Minor Changes

- **init/destroy**: perserve scroll offset. [#67](https://github.com/idiotWu/smooth-scrollbar/issues/67)

## [7.3.1](https://github.com/idiotWu/smooth-scrollbar/compare/v7.3.0...v7.3.1) (2017-05-26)

### Bug Fixes

- **destroy**: uses loop instead of `innerHTML = ''` to avoid empty nodes in IE. ([#77](https://github.com/idiotWu/smooth-scrollbar/pull/77))

## [7.3.0](https://github.com/idiotWu/smooth-scrollbar/compare/v7.2.10...v7.3.0) (2017-05-22)

### Bug Fixes

- **track**: Call `showTrack` whenever position changed. ([d315413](https://github.com/idiotWu/smooth-scrollbar/commit/d315413eb403563637f9eae5f4b7e93470b3341e))

### Features

- **scrollIntoView**: add `alignToTop` option. ([#75](https://github.com/idiotWu/smooth-scrollbar/pull/75))

### Minor Changes

- **scrollTo**: use computed damping factor instead of quadratic curve. [69c3a81](https://github.com/idiotWu/smooth-scrollbar/commit/69c3a813b258ded0a773056b20c4b8b2d149c11b)
- **event/keyboard**: use `document.activeElement` to detect focused element. [44fc594](https://github.com/idiotWu/smooth-scrollbar/commit/44fc5948c80397e940aeb41f2a0d3282bb4799ed)

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
