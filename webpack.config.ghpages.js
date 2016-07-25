const devConfig = require('./webpack.config.dev');
const prodConfig = require('./webpack.config.prod');

module.exports = Object.assign({}, devConfig, {
    watch: false,
    plugins: prodConfig.plugins,
});
