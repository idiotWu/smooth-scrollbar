# Caveats

Customizing scrollbars is always a controversial issue. On the one hand, it provides full control of scrollbars. But on the other hand, it degrades user experience because native behavior is unmatchable. As the author of this script, I don't really want you to use it unless you are sure about what you are doing.

If you just want to customize your scrollbars, you can try out something like [SimpleBar](https://github.com/Grsmto/simplebar) which follows native scrolling.

## Native behavior is unmatchable

Although this script trys to make scrolling experience as smooth as the native one, it still behaves weirdly especially the inertial scrolling. You may upset your users who are using a trackpad or mobile device with touch screen.

Keep in mind that **native scrollbars are always the best ones**.

## Performance issues

This script is using `translate3d` to perform smooth scrolling. However, the larger the scrollable area is, the lower the performace will be. And scrolling may also be jittery on some old devices.

## Incompatible with Pointer Event API

This script is calling `event.preventDefault()` on `touchmove` events to prevent native scrolling. But that breaks pointer event streams and result in some [unexpected consequence](https://github.com/idiotWu/smooth-scrollbar/issues/111).
