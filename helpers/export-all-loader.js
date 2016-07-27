const fs = require('fs');
const path = require('path');
const babel = require('babel-core');

const configFile = path.join(__dirname, '../.babelrc');
const babelOptions = JSON.parse(fs.readFileSync(configFile));

function loadAll(srcDir, baseDir) {
    return fs.readdirSync(srcDir)
        .filter(file => !/index\.js$/.test(file))
        .map(file => `export * from './${file}';`)
        .join('\n');
}

module.exports = function exportAllLoader() {
    const src = path.dirname(this.resourcePath);

    const result = loadAll(src, this.context);
    const compiled = babel.transform(result, babelOptions);

    return compiled.code;
};
