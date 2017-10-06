import {
  Scrollbar,
} from './scrollbar';

import { Data2d } from './data-2d';

// Scrollbar.Plugin
export interface ScrollbarPlugin {
  readonly scrollbar: Scrollbar;
  readonly options: any;

  onInit(): void;
  onDestory(): void;

  transformDelta(delta: Data2d, fromEvent: any): Data2d;
  beforeRender(nextPosition: Data2d, nextMomentum: Data2d): void;
}
