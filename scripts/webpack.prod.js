const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = require('./webpack.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = merge(baseConfig, {
  entry: [
    joinRoot('src/index.ts'),
  ],
  output: {
    path: joinRoot('dist/'),
    filename: 'smooth-scrollbar.js',
    library: 'Scrollbar',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  plugins: [
    new UglifyJSPlugin({
      output: {
        comments: false,
      },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
