const path = require('path');
const webpack = require('webpack');

const devConfig = require('./develop');

module.exports = Object.assign({}, devConfig, {
    devtool: false,
    entry: [
        path.join(__dirname, '../test/scripts/index.js'),
    ],
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
    ].concat(devConfig.plugins),
});
