# angular-smooth-scrollbar

An angular module that helps you to customize high performance scrollbar.

## Requirements

Angular 1.4+

## Install

```
bower install angular-smooth-scrollbar --save
```

## Demo

[http://idiotwu.github.io/angular-smooth-scrollbar/](http://idiotwu.github.io/angular-smooth-scrollbar/)

## Why is native scrolling slow?

As is explained in [this article](http://www.html5rocks.com/en/tutorials/speed/scrolling/), browser repaint every frame in scrolling. **Less painting is better.**

To avoid repainting, I use `translate3d` in scroll content to create composite layers and force hardware accelerating.

## Usage

1. Include the script and stylesheet in your page file:

    ```html
    <link rel="stylesheet" href="bower_components/angular-smooth-scrollbar/dist/smooth-scrollbar.css">

    <script src="bower_components/angular-smooth-scrollbar/dist/smooth-scrollbar.js"></script>
    ```

2. Add `SmoothScrollbar` as dependency to your angular app:

    ```javascript
    angular.module('myApp', ['SmoothScrollbar']);
    ```

3. Use it wherever you want:

    - As element:

        ```html
        <scrollbar name="scrollbarName">
            ...
        </scrollbar>
        ```

    - As attribute:

        ```html
        <section scrollbar="scrollbarName">
            ...
        </section>
        ```

### Available Options

- name: passed through `scrollbar` or `name` attribute, determine the name for this scrollbar instance.
- speed: scrolling speed, default is `1`.
- stepLength: wheel scroll step length(px/delta), default is `40`.
- easingDuration: swipe easing duration(ms), default is `1000`.
- easingCurve: cubic bezier easing function, you can use either css `timing-function` or pre-defined curves [here](http://easings.net/en), default is `cubic-bezier(0.1, 0.57, 0.1, 1)`.

## ScrollbarService

By given scrollbar a name via attribute, you can access your scrollbar instances through `ScrollbarService`.

### ScrollbarService.getInstance( name )

Get scrollbar instance by giving the name, and return a promise with instance.

### ScrollbarService.destroyInstance( name )

Remove all event listeners on the named instance, but will not remove scrollbar from DOM.

## APIs

Scrollbar instance has exposed some methods so that you can controll the scrollbar.

### instance#getSize()

Return the size of scrollbar container and scroll content, it may be something like this:

```javascript
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

### instance#update( cb )

Update the scrollbar right now. This will be useful when you modified scroll content.

If you don't do this manually, scrollbar will be updated with 100ms debounce.

Callback will be invoked with scroolbar instance after scrollbar updated.

### instance#destroy()

Remove all event listeners on scrollbar instance, but won't remove elements on document.

### instance#setPosition( x, y )

This method behaves like DOM method `element.scrollTo`, scroll content will be set to the given position without transition.

### instance#scrollTo( x, y, duration, cb )

When you want to scroll content to position with easing animation, use this method. Callback will be invoked when scrolling is over.

### instance#addListener( cb )

Register scrolling listener to scrollbar instance, callback will be invoked in every small scrolling.

A status object is passed through callback with following properties:

```javascript
{
    direction: {
        // scrolling direction
        x: 'none' | 'right' | 'left',
        y: 'none' | 'up' | 'down'
    },
    offset: {
        // scroll offset
        x: 100,
        y: 0
    },
    limit: {
        // max scroll distance(px)
        x: 1000,
        y: 200
    }
}
```

**Be careful not to add time consuming listeners that will slow down scrolling.**

### instance#removeListener( fn )

Remove the given listener from listeners list.

### instance#infiniteScroll( cb, threshold )

This is another useful method when you want to make infinite scrolling. Callback will be invoked the first time you scroll to given threshold, then when you scrolling over threshold again. Default threshold is 50(px).

## TODO

### 1. A better inertial scrolling algorithm

Smooth scrollbar will calculate you touch moving velocity, and scroll to a distance of `velocity * easingDuration` more when you stop. This algorithm is not same as what the inertial scrolling is in mobile devices.

I've tried using uniformly accelerated motion, but it worked so bad that i have to use `cubic-bezier` easing. If any one has an idea about this, please create an issue or make a pull request, thx.

### 2. SmoothScrollbar for non-angular project

I prefer to use SmoothScrollbar as an universal components, so I am using some DOM-related operations in this project. I wish to build another repo for SmoothScrollbar and let current one to be an extension for angular projects if I have time.