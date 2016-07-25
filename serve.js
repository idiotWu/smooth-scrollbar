/* eslint-disable no-console */
const ip = require('ip');
const webpack = require('webpack');
const Server = require('webpack-dev-server');
const config = require('./webpack.config.dev');

new Server(webpack(config), {
    contentBase: './test/',
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        assets: false,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false,
    },
}).listen(3000, '0.0.0.0', (err) => {
    if (err) {
        console.log(err);
    }

    console.log('Listening at http://localhost:3000');
    console.log(`Remote access: http://${ip.address()}:3000`);
});
