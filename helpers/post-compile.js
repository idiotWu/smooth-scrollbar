const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');

const writeFile = require('./write-file');
const version = require('../package.json').version;
const webpackConfig = require('../webpack.config.prod');
const exportAllLoader = require('../loaders/export-all');

const join = path.join.bind(path, __dirname);

const styleFile = join('../lib/style/style.js');
const source = join('../src/style/smooth-scrollbar.styl');

function compileStyle() {
    // create placeholder
    const destDir = path.dirname(styleFile);

    try {
        fs.accessSync(destDir, fs.F_OK);
    } catch (e) {
        fs.mkdirSync(destDir);
    }

    fs.writeFileSync(styleFile, `module.exports = require('${source}');`);

    webpack(Object.assign(webpackConfig, {
        entry: [styleFile],
        output: {
            path: destDir,
            filename: 'style.js',
        },
        resolve: {
            extensions: ['', '.styl'],
        },
    }), (err) => {
        if (err) {
            throw err;
        }

        // replace entry and version tag
        const target = join('../lib/index.js');
        const content = fs.readFileSync(target)
                            .toString()
                            .replace('smooth-scrollbar.styl', 'style.js')
                            .replace('__SCROLLBAR_VERSION__', JSON.stringify(version));

        fs.writeFileSync(target, content);
    });
}

function compileEntries() {
    glob.sync(join('../lib/*/**/index.js'))
        .forEach(file => {
            const thisArg = {
                resourcePath: file,
                context: path.dirname(file),
            };

            const compiled = exportAllLoader.call(thisArg);
            writeFile(file, compiled);
        });
}

compileStyle();
compileEntries();
