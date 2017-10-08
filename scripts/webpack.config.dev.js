const ip = require('ip');
const path = require('path');
const baseConfig = require('./webpack.config.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = Object.assign(baseConfig, {
  devtool: 'cheap-module-source-map',
  entry: [
    `webpack-dev-server/client?http://${ip.address()}:3000`,
    joinRoot('src/polyfill'),
    joinRoot('__demo__/scripts/index.ts'),
  ],
  output: {
    path: joinRoot('build/js/'),
    filename: 'app.js',
    publicPath: '/build/js/',
  },
  module: {
    rules: baseConfig.module.rules.concat([{
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
    }]),
  },
});
