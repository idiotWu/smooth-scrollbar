/* eslint-disable no-console */
const path = require('path');
const webpack = require('webpack');
const Server = require('webpack-dev-server');
const config = require('./webpack.dev');
const publicUrl = require('./public-url');

new Server(webpack(config), {
  disableHostCheck: true,
  contentBase: path.join(__dirname, '..', '__demo__'),
  publicPath: config.output.publicPath,
  public: publicUrl(3000),
  stats: {
    modules: false,
  },
}).listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.log('Listening at http://localhost:3000');
  console.log(`Remote access: ${publicUrl(3000)}`);
});
