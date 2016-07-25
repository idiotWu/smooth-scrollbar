const webpack = require('webpack');

const devConfig = require('./webpack.config.dev');

module.exports = Object.assign({}, devConfig, {
    devtool: false,
    entry: [
        './test/scripts/index.js',
    ],
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
    ].concat(devConfig.plugins),
});
