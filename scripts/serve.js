/* eslint-disable no-console */
const ip = require('ip');
const path = require('path');
const webpack = require('webpack');
const Server = require('webpack-dev-server');
const config = require('./webpack.dev');

new Server(webpack(config), {
  disableHostCheck: true,
  contentBase: path.join(__dirname, '..', '__demo__'),
  publicPath: config.output.publicPath,
  stats: {
    modules: false,
  },
}).listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.log('Listening at http://localhost:3000');
  console.log(`Remote access: http://${ip.address()}:3000`);
});
