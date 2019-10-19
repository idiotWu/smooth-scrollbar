import * as I from './interfaces/';

import { Scrollbar } from './scrollbar'; // used as type annotations

export class ScrollbarPlugin implements I.ScrollbarPlugin {
  static pluginName = '';
  static defaultOptions: any = {};

  readonly scrollbar: Scrollbar;
  readonly options: any;
  readonly name: string;

  constructor(
    scrollbar: Scrollbar,
    options?: any,
  ) {
    this.scrollbar = scrollbar;
    this.name = new.target.pluginName;

    this.options = {
      ...new.target.defaultOptions,
      ...options,
    };
  }

  onInit() {}
  onDestroy() {}

  onUpdate() {}
  onRender(_remainMomentum: I.Data2d) {}

  transformDelta(delta: I.Data2d, _evt: Event): I.Data2d {
    return { ...delta };
  }
}

export type PluginMap = {
  order: Set<string>,
  constructors: {
    [name: string]: typeof ScrollbarPlugin,
  },
};

export const globalPlugins: PluginMap = {
  order: new Set<string>(),
  constructors: {},
};

export function addPlugins(
  ...Plugins: (typeof ScrollbarPlugin)[]
): void {
  Plugins.forEach((P) => {
    const { pluginName } = P;

    if (!pluginName) {
      throw new TypeError(`plugin name is required`);
    }

    globalPlugins.order.add(pluginName);
    globalPlugins.constructors[pluginName] = P;
  });
}

export function initPlugins(
  scrollbar: Scrollbar,
  options: any,
): ScrollbarPlugin[] {
  return Array.from(globalPlugins.order)
    .filter((pluginName: string) => {
      return options[pluginName] !== false;
    })
    .map((pluginName: string) => {
      const Plugin = globalPlugins.constructors[pluginName];

      const instance = new Plugin(scrollbar, options[pluginName]);

      // bind plugin options to `scrollbar.options`
      options[pluginName] = instance.options;

      return instance;
    });
}
