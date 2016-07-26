const fs = require('fs');
const path = require('path');
const glob = require('glob');

const version = require('../package.json').version;
const exportAllLoader = require('./export-all-loader');

const join = path.join.bind(path, __dirname);

function stripStyle() {
    // replace entry and version tag
    const target = join('../lib/index.js');

    const content = fs.readFileSync(target)
                        .toString()
                        .replace(/require\((['"]).+?smooth-scrollbar.styl\1\);/, '')
                        .replace('__SCROLLBAR_VERSION__', JSON.stringify(version));

    fs.writeFileSync(target, content);
}

function compileEntries() {
    glob.sync(join('../lib/*/**/index.js'))
        .forEach(file => {
            const thisArg = {
                resourcePath: file,
                context: path.dirname(file),
            };

            const compiled = exportAllLoader.call(thisArg);
            fs.writeFileSync(file, `${compiled}\n`);
        });
}

stripStyle();
compileEntries();
