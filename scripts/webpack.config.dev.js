const ip = require('ip');
const path = require('path');
const baseConfig = require('./webpack.config.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = Object.assign(baseConfig, {
  devtool: 'cheap-module-source-map',
  entry: [
    `webpack-dev-server/client?http://${ip.address()}:3000`,
    joinRoot('src/polyfill'),
    joinRoot('test/scripts/index.js'),
  ],
  output: {
    path: joinRoot('build/'),
    filename: 'app.js',
    publicPath: '/build/',
  },
  module: {
    rules: baseConfig.module.rules.concat([{
      test: /\.ts$/,
      enforce: 'pre',
      use: [{
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          formatter: 'stylish',
        },
      }],
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
    }, {
      // FIXME
      test: /\.styl$/,
      use: [
        'style-loader',
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
        joinRoot('test'),
      ],
    }, {
      // TODO: remove this block
      test: /\.js$/,
      enforce: 'pre',
      use: [ 'eslint-loader' ],
      include: [
        joinRoot('test'),
      ],
    }, {
      // TODO: remove this block
      test: /\.js$/,
      use: [ 'babel-loader' ],
      include: [
        joinRoot('test'),
      ],
    }]),
  },
});
