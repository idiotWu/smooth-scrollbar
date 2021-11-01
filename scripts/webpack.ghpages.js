const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = require('./webpack.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: [
    joinRoot('demo/scripts/index.ts'),
  ],
  output: {
    path: joinRoot('ghpages'),
    filename: 'app.js',
    publicPath: '/',
  },
  module: {
    rules: [{
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
            sourceMap: false,
            plugins: () => [ require('autoprefixer') ],
          },
        },
        'stylus-loader',
      ],
      include: [
        joinRoot('demo'),
      ],
    }],
  },
  plugins: [
    new UglifyJSPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
