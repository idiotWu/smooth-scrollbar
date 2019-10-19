import {
  Scrollbar,
} from './scrollbar';

import { Data2d } from './data-2d';

// Scrollbar.Plugin
export interface ScrollbarPlugin {
  readonly scrollbar: Scrollbar;
  readonly options: any;
  readonly name: string;

  onInit(): void;
  onDestroy(): void;

  onUpdate(): void;
  onRender(remainMomentum: Data2d): void;

  transformDelta(delta: Data2d, fromEvent: any): Data2d;
}
