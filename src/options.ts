import {
  range,
  boolean,
} from './decorators/';

import {
  ScrollbarOptions,
} from './interfaces/';

export class Options {
  @range(0, 1)
  damping = 0.1;

  @range(0, Infinity)
  thumbMinSize = 20;

  @boolean
  renderByPixels = true;

  @boolean
  alwaysShowTracks = false;

  @boolean
  continuousScrolling = true;

  wheelEventTarget: EventTarget | null = null;

  plugins: any = {};

  constructor(config: Partial<ScrollbarOptions> = {}) {
    Object.keys(config).forEach((prop) => {
      this[prop] = config[prop];
    });
  }
}
