import * as dat from 'dat-gui';
import Scrollbar from 'smooth-scrollbar';
import OverscrollPlugin from 'smooth-scrollbar/plugins/overscroll';

Scrollbar.use(OverscrollPlugin);

const options = {
  damping: 0.1,
  thumbMinSize: 20,
  renderByPixels: !('ontouchstart' in document),
  alwaysShowTracks: false,
  continuousScrolling: true,
};

const overscrollOptions = {
  enable: true,
  effect: navigator.userAgent.match(/Android/) ? 'glow' : 'bounce',
  damping: 0.2,
  maxOverscroll: 150,
  glowColor: '#222a2d',
};

const scrollbars = [
  Scrollbar.init(document.getElementById('main-scrollbar') as HTMLElement, {
    ...options,
    delegateTo: document,
    plugins: {
      overscroll: { ...overscrollOptions },
    },
  }),
  Scrollbar.init(document.getElementById('inner-scrollbar') as HTMLElement, {
    ...options,
    plugins: {
      overscroll: { ...overscrollOptions },
    },
  }),
];
const controller = new dat.GUI();

function updateScrollbar() {
  scrollbars.forEach((s) => {
    // real-time options
    Object.assign(s.options, options);
    s.updatePluginOptions('overscroll', {
      ...overscrollOptions,
      effect: overscrollOptions.enable ? overscrollOptions.effect : undefined,
    });

    if (options.alwaysShowTracks) {
      s.track.xAxis.show();
      s.track.yAxis.show();
    } else {
      s.track.xAxis.hide();
      s.track.yAxis.hide();
    }
  });
}

const f1 = controller.addFolder('Scrollbar Options');
f1.open();

[
  f1.add(options, 'damping', 0.01, 1),
  f1.add(options, 'thumbMinSize', 0, 100),
  f1.add(options, 'renderByPixels'),
  f1.add(options, 'alwaysShowTracks'),
  f1.add(options, 'continuousScrolling'),
].forEach((ctrl) => {
  ctrl.onChange(updateScrollbar);
});

const f2 = controller.addFolder('Overscroll Plugin Options');
[
  f2.add(overscrollOptions, 'enable'),
  f2.add(overscrollOptions, 'effect', ['bounce', 'glow']),
  f2.add(overscrollOptions, 'damping', 0.01, 1),
  f2.add(overscrollOptions, 'maxOverscroll', 30, 300),
  f2.addColor(overscrollOptions, 'glowColor'),
].forEach((ctrl) => {
  ctrl.onChange(updateScrollbar);
});

const el = document.getElementById('controller');

if (el) {
  el.appendChild(controller.domElement);
}

if (window.innerWidth < 600) {
  controller.close();
}

export { controller };
