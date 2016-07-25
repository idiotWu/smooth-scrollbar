const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');

const version = require('./package.json').version;
const join = path.join.bind(path, __dirname);

const sources = ['src', 'test'].map(dir => join(dir));

module.exports = {
    watch: true,
    devtool: 'eval-cheap-module-source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        './test/scripts/index.js',
    ],
    output: {
        path: join('build'),
        filename: 'app.js',
        publicPath: '/build/',
    },
    resolve: {
        extensions: ['', '.js', '.styl'],
    },
    resolveLoader: {
        alias: {
            'export-all': join('./loaders/export-all.js'),
        },
    },
    module: {
        preLoaders: [{
            test: /\.js$/,
            loaders: ['eslint'],
            include: sources,
            formatter: eslintFriendlyFormatter,
        }],
        loaders: [{
            test: /\.js$/,
            loaders: ['babel'],
            include: sources,
        }, {
            test: /\.styl/,
            loaders: [
                'style',
                'css',
                'postcss',
                'stylus?sourceMap',
            ],
        }],
    },
    postcss: [autoprefixer],
    plugins: [
        new webpack.DefinePlugin({
            __SCROLLBAR_VERSION__: JSON.stringify(version),
        }),
    ],
};
