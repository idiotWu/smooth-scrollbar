const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');
const publicUrl = require('./public-url');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [
    `webpack-dev-server/client?${publicUrl(3000)}`,
    joinRoot('__demo__/scripts/index.ts'),
  ],
  output: {
    path: joinRoot('.tmp'),
    filename: 'app.js',
    publicPath: '/',
  },
  module: {
    rules: [{
      test: /\.ts$/,
      enforce: 'pre',
      use: [{
        loader: 'tslint-loader',
        options: {
          // type check is slow, see
          // https://github.com/wbuchwalter/tslint-loader/issues/76
          // typeCheck: true,
          formatter: 'stylish',
        },
      }],
      include: [
        joinRoot('src'),
        joinRoot('__demo__'),
      ],
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
    }, {
      test: /\.styl$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: () => [ require('autoprefixer') ],
          },
        },
        'stylus-loader',
      ],
      include: [
        joinRoot('__demo__'),
      ],
    }],
  },
});
