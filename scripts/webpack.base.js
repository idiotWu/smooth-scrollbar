const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = {
  resolve: {
    extensions: ['.js', '.ts', '.css', '.styl'],
    alias: {
      'smooth-scrollbar': joinRoot('src'),
    },
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            declaration: false,
          },
        },
      }],
      include: [
        joinRoot('src'),
        joinRoot('__demo__'),
      ],
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      __SCROLLBAR_VERSION__: JSON.stringify(
        process.env.SCROLLBAR_VERSION || require('../package.json').version,
      ),
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
  stats: {
    modules: false,
  },
};
