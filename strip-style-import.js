const fs = require('fs');
const path = require('path');

const version = require('./package.json').version;

function stripStyle() {
    // replace entry and version tag
    const target = path.join(__dirname, 'lib/index.js');

    const content = fs.readFileSync(target)
                        .toString()
                        // eslint-disable-next-line no-useless-escape
                        .replace(/require\((['"]).+?smooth-scrollbar.styl\1\);/, '')
                        .replace('__SCROLLBAR_VERSION__', JSON.stringify(version));

    fs.writeFileSync(target, content);
}

stripStyle();
