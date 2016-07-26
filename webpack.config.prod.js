const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');

const version = require('./package.json').version;
const join = path.join.bind(path, __dirname);

const source = join('./src/');

module.exports = {
    entry: [
        './src/index.js',
    ],
    output: {
        path: join('dist'),
        filename: 'smooth-scrollbar.js',
        library: 'Scrollbar',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['', '.js', '.styl'],
    },
    resolveLoader: {
        alias: {
            'export-all': join('./helpers/export-all-loader.js'),
        },
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            loaders: ['eslint'],
            include: source,
            formatter: eslintFriendlyFormatter,
        }],
        loaders: [{
            test: /\.js$/,
            loaders: ['babel'],
            include: source,
        }, {
            test: /\.styl/,
            loader: ExtractTextPlugin.extract('style', [
                'css',
                'postcss',
                'stylus',
            ]),
        }],
    },
    postcss: [autoprefixer],
    plugins: [
        new webpack.DefinePlugin({
            __SCROLLBAR_VERSION__: JSON.stringify(version),
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
        new ExtractTextPlugin('smooth-scrollbar.css'),
    ],
};
