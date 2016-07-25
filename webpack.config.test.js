const devConfig = require('./webpack.config.dev');

module.exports = Object.assign({}, devConfig, {
    watch: false,
});
