# Caveats

Emulating scrollbars with JavaScript is always a controversial issue. On the one hand, it provides complete control of scrollbars. On the other hand, however, it degrades user experience because native behavior is unmatchable. As the author of this plugin, I don't really want you to use it unless you are sure about what you are doing.

If you just want to customize your scrollbars, you can try something like [OverlayScrollbars](https://github.com/KingSora/OverlayScrollbars) which follows the native scrolling.

## Native Behavior is Unmatchable

Although this plugin tries to emulate the scrolling experience as close to the native one as possible, it still behaves weirdly especially with trackpads or touch screens, as the scrolling delta will be interpolated/smoothened twice: by the native inputs and by this plugin.

Keep in mind that **native scrollbars are always the best ones**.

## Performance Issues

Back in the days that this plugin was created, [the native scrolling was quite slow](https://www.html5rocks.com/en/tutorials/speed/scrolling/) notably on touch devices. Therefore, I wrote this plugin using `translate3d` to improve scrolling performance. Now that modern browsers have done a lot improving native scrolling performance, I don't think you will need this one anymore. What's worse, as the scrollable area grows, this plugin will consume a large amount of GPU resources, resulting in jittery scrolling.

## Incompatible with Pointer Event API

This plugin is calling `event.preventDefault()` on `touchmove` events to prevent the native scrolling. However, this breaks pointer event streams and gives some [unexpected consequences](https://github.com/idiotWu/smooth-scrollbar/issues/111#issuecomment-339243256).
