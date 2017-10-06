import * as I from './interfaces/';

export class ScrollbarPlugin implements I.ScrollbarPlugin {
  static pluginName = '';
  static defaultOptions: any = {};

  readonly scrollbar: I.Scrollbar;
  readonly options: any;

  constructor(
    scrollbar: I.Scrollbar,
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

  beforeRender(_p, _m) {}

  transformDelta(delta: I.Data2d, _evt): I.Data2d {
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
  scrollbar: I.Scrollbar,
): I.ScrollbarPlugin[] {
  const pluginOptions = scrollbar.options.plugins;

  return Array.from(globalPlugins.order)
    .map((pluginName: string) => {
      const Plugin = globalPlugins.constructors[pluginName];
      const options = pluginOptions[pluginName];

      return new Plugin(scrollbar, options);
    });
}
