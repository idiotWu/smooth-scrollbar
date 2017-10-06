const path = require('path');
const webpack = require('webpack');
const version = require('../package.json').version;
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = {
  resolve: {
    extensions: ['.js', '.ts', '.css', '.styl' /* FIXME */],
    alias: {
      'smooth-scrollbar': joinRoot('src'),
    },
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [ 'ts-loader' ],
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      __SCROLLBAR_VERSION__: JSON.stringify(version),
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
};
