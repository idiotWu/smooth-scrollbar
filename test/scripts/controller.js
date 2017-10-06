import Scrollbar from '../../src/';

const options = {
  damping: 0.1,
  thumbMinSize: 20,
  renderByPixels: true,
  alwaysShowTracks: false,
  continuousScrolling: true,
};

const optionLimit = {
  damping: {
    type: 'range',
    value: [0.01, 1],
  },
  thumbMinSize: {
    type: 'range',
    value: [0, 100],
  },
};

const boolMap = {
  true: true,
  false: false,
};

const scrollbars = Scrollbar.initAll(options);
const controller = new dat.GUI();
controller.addFolder('Scrollbar Options');
document.getElementById('controller').appendChild(controller.domElement);

let updateScrollbar = () => scrollbars.forEach((s) => {
  Object.assign(s.options, options);
  if (options.alwaysShowTracks) {
    s.track.xAxis.show();
    s.track.yAxis.show();
  } else {
    s.track.xAxis.hide();
    s.track.yAxis.hide();
  }
});

if (window.innerWidth < 600) controller.close();

Object.keys(options).forEach((prop) => {
  let ctrl;

  if (optionLimit.hasOwnProperty(prop)) {
    const limit = optionLimit[prop];

    if (limit.type === 'range') {
      ctrl = controller.add(options, prop, ...limit.value);
    }

    if (limit.type === 'select') {
      ctrl = controller.add(options, prop, limit.value);
    }
  } else {
    ctrl = controller.add(options, prop);
  }

  ctrl.onChange((val) => {
    if (boolMap.hasOwnProperty(val)) {
      options[prop] = boolMap[val];
    }

    updateScrollbar();
  });
});

export { controller };
