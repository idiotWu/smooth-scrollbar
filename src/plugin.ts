import * as I from './interfaces/';

import { Scrollbar } from './scrollbar';

export class ScrollbarPlugin implements I.ScrollbarPlugin {
  static pluginName = '';
  static defaultOptions: any = {};

  readonly scrollbar: Scrollbar;
  readonly options: any;

  constructor(
    scrollbar: Scrollbar,
    options: any = {},
  ) {
    this.scrollbar = scrollbar;
    this.options = {
      ...new.target.defaultOptions,
      ...options,
    };
  }

  onInit() {}
  onDestory() {}
  onRender(_offset: I.Data2d, _remainMomentum: I.Data2d) {}

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
  ...Plugins: (typeof ScrollbarPlugin)[],
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
): ScrollbarPlugin[] {
  const pluginOptions = scrollbar.options.plugins;

  return Array.from(globalPlugins.order)
    .map((pluginName: string) => {
      const Plugin = globalPlugins.constructors[pluginName];
      const options = pluginOptions[pluginName];

      return new Plugin(scrollbar, options);
    });
}
